import logging
import settings
import math
import urllib
import json
import time

import datetime

from datamodel import *
from functools import wraps
from google.appengine.ext import ndb
from google.appengine.api import urlfetch

def memoized_route(func):
    cache = {}
    # Read data from datastore
    quer = Distance.query(ancestor=settings.DEFAULT_PARENT_DIST_KEY)
    cache = {(p.from_id, p.to_id): p.duration_value for p in quer}
    logging.info((len(cache)))
    @wraps(func)
    def wrap(fr, to, *args):
        k = (fr.key.id(), to.key.id())
        if k not in cache:
            route = func(fr, to, *args)
            duration = route['routes'][0]['legs'][0]['duration']
            dur_val = duration['value']
            dur_text = duration['text']
            cache[k] = dur_val
            # put to datastore
            dist = Distance(parent=settings.DEFAULT_PARENT_DIST_KEY,
                            from_id=fr.key.id(),
                            to_id=to.key.id(),
                            duration_value=dur_val,
                            duration_text=dur_text)
            dist.put()

        return cache[k]
    return wrap

def gain(place, dt, pref='culture'):
    """calculate_gain(place, pref) -> gain including preference, time of visit, suitability
    place(Place)            : the place of attraction
    dt(datetime.datetime)   : time of visit
    pref(string)            : preference of the tour
    gain(float)             : calculated gain of the given place
    
    Return the total gain for a place, additional gain for pref
    Since the factor is arbitrarily doubled, mathematical reduction gives the 
    calculation as followed:
        total gain = place.popularity * (attr for attr in place.attribute)
        => total gain = place.popularity * (all attr + bonus attr)
        => total gain = place.popularity * (1 + bonus attr)

    Preference gain: 100%
    Time of visit gain: 10%
    Suitability gain: fixed. Constant defined in settings.py
    """
    total_gain = 0
    # Preference calculation
    total_gain += place.popularity * (1 + getattr(place, pref))

    # Time of visit calculation
    time_gain = ''
    t = dt.time()
    if t <= datetime.time(6,0):
        time_gain = 'night' 
    elif t <= datetime.time(12,0):
        time_gain = 'morning'
    elif t <= datetime.time(18,0): 
        time_gain = 'afternoon'
    else: 
        time_gain = 'evening'

    total_gain += (place.popularity / 10) * (1 + getattr(place, time_gain))
    
    # Suitability fixed gain
    for i in (place.handicapped, place.children, place.infants, place.elderlies):
        if i:
            total_gain += settings.SUITABILITY_GAIN

    return total_gain

def process(place, pace='moderate'):
    """Return timedelta object"""
    d = str_to_td(place.duration)
    (slow, moderate, fast, hectic) = (1.5, 1.0, 0.75, 0.5)
    d = datetime.timedelta(seconds=d.total_seconds() * locals()[pace])
    return d

@memoized_route
def find_route(fr, to, depart_time, postal=False):
    """find_route(fr, to, depart_time, postal=False) -- Return the json object of the found route
    Since we are only using Transit and no Waypoints, there will be only 1 route and within it, only 1 leg
    Hence, we can use index [0] to access the element
    """
    if postal:
        origin = fr.postal.encode('utf-8')
        destination = to.postal.encode('utf-8')
    else:
        origin = fr.address.encode('utf-8')
        destination = to.address.encode('utf-8')
    
    logging.info('Finding route from %s to %s' % (origin, destination))
    base_url = 'https://maps.googleapis.com/maps/api/directions/json'
    para =  {
                'origin'            : origin,
                'destination'       : destination,
                'mode'              :'transit',
                'departure_time'    : depart_time,
                'region'            : 'sg',
                'key'               : settings.API_KEY
            }
    
    attempts = 0
    success = False
    url = base_url + '?' + urllib.urlencode(para)

    dt = datetime.datetime.fromtimestamp(depart_time)
    
    while success != True and attempts < 3:
        result = json.load(urllib.urlopen(url))
        attempts += 1

        if result['status'] == 'OK':
            logging.info('Status is OK')
            return result

        elif result['status'] == 'ZERO_RESULTS' and not postal:
            # Retry using postal code
            logging.info('Status is ZERO_RESULTS, retrying with postal')
            return find_route(fr, to, depart_time, postal=True)

        elif result['status'] == 'OVER_QUERY_LIMIT':
            time.sleep(1)
            # Retry
            continue
        success = True

    if attempts == 3:
        logging.warning('Direction search limit reached')
        return None

def dur(result):
    """Return timedelta object: the duration of the route, extracted from json information"""
    if (type(result) is not int):
        result = result['routes'][0]['legs'][0]['duration']['value']

    return datetime.timedelta(seconds=result)

# We give a 4-hour difference between the touchdown time of the user on the first day and the starting time
# of tour.
# We also give a 4-hour difference between the last visit and the departure time.
# If tour starts too late for the first day or too early for the last day. Consider discard them
# Tour is considered to be too late when the start time is past 22:00
# Tour is considered to be too early when the end time is before 10:00
TIME_DELAY = 4 # hours
def too_late(dt):
    return dt.hour >= 22 or dt.hour <= 7

def too_early(dt):
    return dt.hour < 10

def num_of_tour(start_dt, end_dt):
    num = (end_dt.date() - start_dt.date()).days + 1
    if too_late(start_dt): num -= 1
    if too_early(end_dt): num -= 1
    return num

def str_to_td(time_str):
    """Convert from string of format 00:00 to datetime.timedelta object"""
    if time_str:
        hour, minute = time_str.split(':')
        delta = datetime.timedelta(hours=int(hour), minutes=int(minute))
        return delta
    else:
        return datetime.timedelta(0)

def dt_to_epoch(dt):
    """Convert from datetime.datetime object to number of seconds since epoch
    Somehow I need to minus the timezone different
    """
    return int((dt - datetime.datetime.fromtimestamp(0) - datetime.timedelta(hours=8)).total_seconds())

def time_to_td(ti):
    """Convert from datetime.time object to timedelta object"""
    return datetime.timedelta(hours=ti.hour, minutes=ti.minute, seconds=ti.second)

def gain_index(g):
    if g == 0: return 0
    else:
        return int(math.ceil(math.log(g, 1 + settings.ESP)))


def generate_trip(start_dt, end_dt, hotel, pref='culture', pace='moderate'):
    """This is where magic happens
    Using dynamic programming to approximate solution to Prize-collecting Traveling Salesman
    Problem with Time Windows (PCTSPTW).

    Reduce the gain to a logarithmic factor of (1 + esp) for approximation

    Based on the density

    This is going to be quite bad since the experimental value of density is quite high.

    Approximation factor = (1 + esp) * (floor(density) + 1)
    Just hope it work!

    Improved version: Reduce redundant rows in the DP table

    start_dt(datetime.datetime):    Starting date and time. datetime.datetime object
    end_dt(datetime.datetime):      Ending date and time. datetime.datetime object

    hotel(Hotel):   hotel object serves as the starting point. And end point after 19:00
    """
    # Initialise places_dict
    # Add id = 0 for hotel
    places_dict = {place.key.id(): place for place in Place.query(ancestor=settings.DEFAULT_PARENT_KEY)}
    places_dict[0] = hotel

    # Initialise some constants
    tour_num = num_of_tour(start_dt, end_dt)
    if tour_num == 0: return []
    
    # Initialise starting datetime and ending datetime according to TIME_DELAY
    start_dt = start_dt + datetime.timedelta(hours=TIME_DELAY)
    end_dt = end_dt - datetime.timedelta(hours=TIME_DELAY)

    # Number of places
    N = len(places_dict)
    # Biggest possible gain -> max column
    max_gain = 1.10 * math.fsum(places_dict[p].popularity for p in places_dict if p != 0) \
                + settings.SUITABILITY_GAIN * 4 * N
    S = gain_index(max_gain)

    trip_visited = set([0])
    # Lists of a pair of places id and the number of places before evening cutoff 
    trip = [[] for i in xrange(tour_num)] 

    # If start_dt is too late. Start tour on the next date.
    tour_start_dt = too_late(start_dt) and start_dt + datetime.timedelta(days=1) or start_dt 
    
    # Main for loop
    for n in xrange(tour_num):
        L = [[{} for j in xrange(S+1)]]
        P = [[{} for j in xrange(S+1)]] # Store the route json returned from query
        
        # Initialise tour. If tour not too late, then start with time in start_dt. Otherwise start at 
        # settings.TOUR_START_TIME(datetime.time)
        tour_start_dt += datetime.timedelta(days=n) # If how much tour_start_dt is away from the actual start
        if (tour_start_dt > start_dt): # When tour starts the next day
            tour_start_dt = tour_start_dt.replace(hour=settings.TOUR_START_TIME.hour, \
                                                  minute=settings.TOUR_START_TIME.minute)
        else:
            pass # Just let tour_start_dt to have the info from start_dt on the 0 day

        base_dt = tour_start_dt.replace(hour=0,minute=0) # Setting base datetime for calculation

        # trip_visited will be added at the end of the loop. Before a new iteration.
        # trip_visited contains places that are already visited during the whole trip
        # Special id=0 to represent hotel
        L[0][0][0] = (tour_start_dt, 0, trip_visited) # (start_dt, profit, visited place to exclude)
        P[0][0][0] = (None, None) # (id of previous place, column)
        
        i = 0
        cutoff = None
        cutoff_dt = base_dt + time_to_td(settings.TOUR_CUTOFF_TIME)

        # Loop to find a tour
        while i < len(L) and reduce(lambda x, y: x or y, L[i]):
            for j in (j for j in xrange(S + 1) if L[i][j]):
                for v_id, (dt, p, visited) in L[i][j].items():
                    for u_id in (u_id for u_id in (set(places_dict.keys()) - visited)):
                        if u_id != v_id:
                            v = places_dict[v_id]
                            u = places_dict[u_id]
                            
                            # Depart time in UNIX time
                            # If depart time is too late then call it a day
                            depart_dt = dt + process(v, pace)
                            if not too_late(depart_dt):
                                route = find_route(v, u, dt_to_epoch(depart_dt))
                                duration_td = dur(route)
                                
                                dt_ = max(str_to_td(u.opening) + base_dt, depart_dt + duration_td) 
                                # If it is still possible to enjoy the place
                                if dt_ <= base_dt + str_to_td(u.closing) + str_to_td(u.duration):
                                    
                                    # If dt_ passes the cutoff hour
                                    if not cutoff and dt_ >= cutoff_dt:
                                        cutoff = i
                                    
                                    # Add another layer to L and P if i == len(L) - 1
                                    if i == len(L) - 1:
                                        L.append([{} for k in xrange(S + 1)])
                                        P.append([{} for k in xrange(S + 1)])

                                    p_ = p + gain(u, dt_, pref)
                                    gain_idx = gain_index(p_)
                                    # Replace-if-min step in the algorithm
                                    if u_id in L[i+1][gain_idx]:
                                        if dt_ < L[i+1][gain_idx][u_id][0]: # Replace if dt_ < the current dt
                                            new_visited = visited.copy()
                                            new_visited.add(u_id)
                                            L[i+1][gain_idx][u_id] = (dt_, p_, new_visited)
                                            P[i+1][gain_idx][u_id] = (v_id, j)
                                    else:
                                        new_visited = visited.copy()
                                        new_visited.add(u_id)
                                        L[i+1][gain_idx][u_id] = (dt_, p_, new_visited)
                                        P[i+1][gain_idx][u_id] = (v_id, j)
            i += 1
        #--- End of while loop ---
        
        # Assign the whole tour to trip. Add to trip_visited
        row = -1
        col = next(c for c in xrange(S, -1, -1) if L[row][c])
        last_cell = L[row][col]
        v_id = min(last_cell, key=last_cell.get) # Place id of the last cell
        dt = last_cell[v_id][0] # dt of the last place
        
        while v_id is not None:
            trip[n].append((places_dict[v_id], dt_to_epoch(dt) * 1000))
            trip_visited.add(v_id)
            v_id, col = P[row][col][v_id]
            row -= 1
            
            if v_id != None:
                dt = L[row][col][v_id][0]

        # Make a tuple with cutoff
        trip[n].reverse()
        trip[n] = (trip[n], cutoff)
    # End of for loop
    # Do stuff here to generate back the trip or simply pass trip to jinja2 to generate.
    return trip

