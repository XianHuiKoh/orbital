import logging
from datamodel import *
from google.appengine.ext import ndb

DEFAULT_PARENT_KEY = ndb.Key(Place, 'Singapore') # Using this for place ancestor query

def gain(place, time=0, pref='culture'):
    """calculate_gain(place, pref) -> gain including preference, time of visit, suitability
    place(Place): the place of attraction
    pref(string): preference of the tour
    gain(float): calculated gain of the given place
    
    Return the total gain for a place, additional gain for pref
    Since the factor is arbitrarily doubled, mathematical reduction gives the 
    calculation as followed:
        total gain = place.popularity * (attr for attr in place.attribute)
        => total gain = place.popularity * (all attr + bonus attr)
        => total gain = place.popularity * (1 + bonus attr)

    Preference gain: 100%
    Time of visit gain: 10%
    Suitability gain: fixed. 50 for each categories
    """
    total_gain = 0
    # Preference calculation
    total_gain += place.popularity * (1 + getattr(place, pref))

    # Time of visit calculation
    HOUR = 60 # minutes
    time_gain = ''
    if time in xrange(6 * HOUR):
        time_gain = 'night' 
    elif time in xrange(6 * HOUR, 12 * HOUR):
        time_gain = 'morning'
    elif time in xrange(12 * HOUR, 18 * HOUR):
        time_gain = 'afternoon'
    elif time in xrange(18 * HOUR, 24 * HOUR):
        time_gain = 'evening'
    else:
        loggin.warning('time %d is not valid' % time)

    total_gain += (place.popularity/10) * (1 + getattr(place, time_gain))
    
    # Suitability fixed gain
    SUIT_GAIN = 50
    for i in (place.handicapped, place.children, place.infants, place.elderlies):
        if i:
            total_gain += SUIT_GAIN

    logging.info('Total gain is: %.2f' % total_gain)

    return total_gain

