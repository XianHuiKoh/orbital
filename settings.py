from google.appengine.ext import ndb
import datamodel
import datetime

DEFAULT_PARENT_KEY = ndb.Key(datamodel.Place, 'Singapore')
DEFAULT_PARENT_DIST_KEY = ndb.Key(datamodel.Distance, 'Singapre')
#API_KEY='AIzaSyBXGj9rnmO8a7ilHIxAUP4ZcYozXtzuJTA'
API_KEY='AIzaSyBaUfFmR3OAKI7Q0VWxBiOv-4tLZtx5Qmc'
# Generate Tour Constants
SUITABILITY_GAIN = 50
ESP = 0.5
TOUR_CUTOFF_TIME = datetime.time(20,0)
TOUR_START_TIME = datetime.time(8,0)

