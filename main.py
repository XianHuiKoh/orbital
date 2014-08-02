#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import jinja2
import os
import logging
import settings
import json
import algorithm

from google.appengine.ext import ndb
from google.appengine.api import mail

from datetime import datetime, date, time, timedelta
from datamodel import *

def guess_autoescape(template_name):
    if template_name is None or '.' not in template_name:
        return False
    ext = template_name.rsplit('.', 1)[1]
    return ext in ('html', 'htm', 'xml')

def tojson(data):
    return json.dumps(data) 

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"),
                                    extensions=['jinja2.ext.autoescape'])

jinja_environment.filters['tojson'] = tojson


class PlaceEntry(webapp2.RequestHandler):
    """ Form for getting and displaying places. """

    def show(self):
        # Displays the page. Used by both get and post
        places = Place.query(ancestor=settings.DEFAULT_PARENT_KEY).order(-Place.popularity, Place.name)
        
        places_dict = {place.key.id(): place for place in Place.query(ancestor=settings.DEFAULT_PARENT_KEY)}
        for k, v in places_dict.items():
            logging.info(v)
        
        template_values = {
            'places': places
        }

        template = jinja_environment.get_template('placeentry.html')
        self.response.write(template.render(template_values))

    def get(self):
        self.show()

    def post(self):
        # Retrieve Places
        place = Place(parent=settings.DEFAULT_PARENT_KEY)

        place.name              = self.request.get('name').rstrip()
        place.desc              = self.request.get('desc').rstrip()
        place.address           = self.request.get('address').rstrip()
        place.postal            = 'Singapore ' + self.request.get('postal').rstrip()
        place.popularity        = float(self.request.get('popularity'))
        place.image             = self.request.get('image').rstrip()
        place.loc_type          = self.request.get('loc_type').rstrip()
        place.duration          = self.request.get('duration').rstrip()
        place.opening           = self.request.get('opening').rstrip()
        place.closing           = self.request.get('closing').rstrip()
        
        place.nature            = float(self.request.get('nature'))
        place.shopping          = float(self.request.get('shopping'))
        place.culture           = float(self.request.get('culture'))
        place.family            = float(self.request.get('family'))
        place.romance           = float(self.request.get('romance'))
        place.food              = float(self.request.get('food'))
        
        place.night             = float(self.request.get('night'))
        place.morning           = float(self.request.get('morning'))
        place.afternoon         = float(self.request.get('afternoon'))
        place.evening           = float(self.request.get('evening'))

        place.handicapped       = bool(self.request.get('handicapped'))
        place.children          = bool(self.request.get('children'))
        place.infants           = bool(self.request.get('infants'))
        place.elderlies         = bool(self.request.get('elderlies'))
        
        place.geocode = algorithm.getGeocode(place)
        
        # Store the place no matter what
        place.put()

        self.redirect('/placeentry')

class MainHandler(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template("home.html")
        template_values = {}
        self.response.write(template.render(template_values))

class Planner(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template("planner.html")
        template_values = {}
        self.response.write(template.render(template_values))

   
class YourTrip(webapp2.RequestHandler):
    def show(self, template_values=None):
        template = jinja_environment.get_template("yourtrip.html")
        if template_values is None:
            template_values = {}
        self.response.write(template.render(template_values))
   
    def get(self):
        self.show()

    def post(self):
        """Do calculation of the trip. And pass the results as a complete 
        list to template_values()

        Then display the results accordingly.
        """
        # Taking parameter from the form
        start_dt            = self.request.get('start_datetime')
        end_dt              = self.request.get('end_datetime')
        hotel               = self.request.get('hotel_option')
        preference          = self.request.get('preference_input') || 'culture'
        pace                = self.request.get('pace_input') || 'moderate'
        misc_pref           = self.request.get('misc_input')
        
        
        # Process parameter from form
        start_datetime = datetime.strptime(start_dt, '%d/%m/%Y %I:%M %p')
        end_datetime = datetime.strptime(end_dt, '%d/%m/%Y %I:%M %p')
        # TODO: Implement hotel option and reflect choice here
        #hotel = Hotel(name="The Forest by Wangz",
        #              desc="Very nice hotel owned by Wangz, I guess",
        #              address="145A Moulmein Rd, Singapore 308108",
        #              postal="Singapore 308108",
        #              image="",
        #              duration="00:00",
        #              opening="00:00",
        #              closing="23:59")
        #hotel.geocode = algorithm.getGeocode(hotel)
        #logging.info(hotel.geocode)
        #hotel.put()
        
        # Store the place
        qry = ndb.gql("SELECT * FROM Hotel WHERE name =	'The Forest by Wangz'")
        for i in qry:
            hotel = i

        # Magic happens here. Then the magic will pass the complete list of
        # the initerary along as template_values for displaying.
        
        trip = algorithm.generate_trip(start_datetime, end_datetime, hotel, preference, pace)
        tripOptions =   {
                            "preference": preference,
                            "pace": pace
                        }
        #initerary = find_route()
        template_values = {
            'trip': trip,
            'tourNum': len(trip),
            'startDate': start_dt,
            'endDate': end_dt,
            'tripOptions': tripOptions
        }
        self.show(template_values)

    
class MassEntry(webapp2.RequestHandler):
    def post(self):
        with open('PlacesOfAttraction.json', 'r') as infile:
            data = json.load(infile)
            numOfPlaces = int(self.request.get('numOfPlaces'))
            for i in xrange(numOfPlaces):
                d = data[i]
                place = Place(parent=settings.DEFAULT_PARENT_KEY)

                for k, v in d.items():
                    if k.strip():
                        if k not in ('handicapped', 'children', 'infants', 'elderlies'):
                            setattr(place, k, v)
                        else:
                            v = v and True or False
                            setattr(place, k, v)

                place.night = 0.25
                place.morning = 0.25
                place.afternoon = 0.25
                place.evening = 0.25
                
                place.geocode = algorithm.getGeocode(place)

                place.put()

            infile.close()
            self.redirect('/placeentry')

class HotelEntry(webapp2.RequestHandler):
    def post(self):
        hotel = Hotel(name="The Forest by Wangz",
                      desc="Very nice hotel owned by Wangz, I guess",
                      address="145A Moulmein Rd, Singapore 308108",
                      postal="Singapore 308108",
                      image="",
                      duration="00:00",
                      opening="00:00",
                      closing="23:59")
        hotel.geocode = algorithm.getGeocode(hotel)
        logging.info(hotel.geocode)
        hotel.put()
        self.redirect('/placeentry')


class Contact(webapp2.RequestHandler):
    def show(self, template_values=None):
        template = jinja_environment.get_template("contact.html")
        if template_values is None:
            template_values = {}
        
        self.response.write(template.render(template_values))

    def post(self): 
      #  feedback_comments          = self.request.get('comments')
      #  
      #  message = mail.EmailMessage(sender="xianhui.koh@gmail.com",
      #                      subject="Feedback")

      #  message.to = "xianhui.koh@gmail.com"
      #  message.body = "%s" % (feedback_comments)

      #  message.send()
        
        mail.send_mail(    
                            sender='Xian Hui <xianhui.koh@gmail.com>',
                            to='Xian Hui <xianhui.koh@gmail.com>',
                            cc='Nguyen Thanh Nhan <ngthnhan93@gmail.com>',
                            subject='Feedback on SingaPlanner',
                            body=self.request.get('comments')
                        )

        
        template_values = {"thank_message":"Thank you!"}
        self.show(template_values)
    
    def get(self):
        self.show()    
        
class Attraction(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template("attraction.html")
        template_values = {}
        self.response.write(template.render(template_values))

app = webapp2.WSGIApplication([
        ('/', MainHandler),
        ('/planner', Planner),
        ('/placeentry', PlaceEntry),
        ('/placeentrymass', MassEntry),
        ('/yourtrip', YourTrip),
        ('/attraction', Attraction),
        ('/hotelentry', HotelEntry),
        ('/contact', Contact)
], debug=True)
