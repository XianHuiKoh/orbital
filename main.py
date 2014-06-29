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

from google.appengine.ext import ndb

def guess_autoescape(template_name):
    if template_name is None or '.' not in template_name:
        return False
    ext = template_name.rsplit('.', 1)[1]
    return ext in ('html', 'htm', 'xml')

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"),
                                    extensions=['jinja2.ext.autoescape'])


class Places(ndb.Model):
    # place_id = ndb.IntegerProperty()
    place_name = ndb.StringProperty()
    place_image = ndb.StringProperty()
    place_desc = ndb.TextProperty()
    place_rating = ndb.IntegerProperty()

class PlaceEntry(webapp2.RequestHandler):
    """ Form for getting and displaying places. """

    def show(self):
        # Displays the page. Used by both get and post
        places = Places.query(ancestor=ndb.Key(Places, 'Singapore')).order(-Places.place_rating, Places.place_name)

        template_values = {
            'places': places 
        }

        template = jinja_environment.get_template('placeentry.html')
        self.response.write(template.render(template_values))

    def get(self):
        self.show()

    def post(self):
        # Retrieve Places
        place = Places(parent=ndb.Key(Places, 'Singapore'))

        place.place_name = self.request.get('name')
        place.place_image = self.request.get('image')
        place.place_desc = self.request.get('desc')
        place.place_rating = int(self.request.get('rating'))

        # Store the place no matter what
        place.put()

        self.show()

class DeletePlace(webapp2.RequestHandler):
    # Delete a place specified by user

    def post(self):
        place = ndb.Key('Places', self.request.get('id'))
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
