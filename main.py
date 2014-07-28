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

from google.appengine.ext import ndb
from datamodel import *

def guess_autoescape(template_name):
    if template_name is None or '.' not in template_name:
        return False
    ext = template_name.rsplit('.', 1)[1]
    return ext in ('html', 'htm', 'xml')

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"),
                                    extensions=['jinja2.ext.autoescape'])


DEFAULT_PARENT_KEY = ndb.Key(Place, 'Singapore') # Using this for ancestor query

class PlaceEntry(webapp2.RequestHandler):
    """ Form for getting and displaying places. """

    def show(self):
        # Displays the page. Used by both get and post
        places = Place.query(ancestor=DEFAULT_PARENT_KEY).order(-Place.popularity, Place.name)
        template_values = {
            'places': places
        }

        template = jinja_environment.get_template('placeentry.html')
        self.response.write(template.render(template_values))

    def get(self):
        self.show()

    def post(self):
        # Retrieve Places
        place = Place(parent=DEFAULT_PARENT_KEY)

        place.desc              = self.request.get('desc').rstrip()
        place.address           = self.request.get('address').rstrip()
        place.postal            = self.request.get('postal').rstrip()
        place.popularity        = float(self.request.get('popularity'))
        place.image             = self.request.get('image').rstrip()
        place.loc_type          = self.request.get('loc_type').rstrip()
        place.duration          = place.to_minute(self.request.get('duration').rstrip())
        place.opening           = place.to_minute(self.request.get('opening').rstrip())
        place.closing           = place.to_minute(self.request.get('closing').rstrip())
        
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
        
        # Store the place no matter what
        place.put()

        self.redirect('/placeentry')

class DeletePlace(webapp2.RequestHandler):
    # Delete a place specified by user

    def post(self):
        place = ndb.Key('Place', self.request.get('id'))
        place.delete()
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

app = webapp2.WSGIApplication([
        ('/', MainHandler),
        ('/planner', Planner),
        ('/placeentry', PlaceEntry),
        ('/deleteplace', DeletePlace)
], debug=True)
