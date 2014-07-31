from google.appengine.ext import ndb
import datamodel
import datetime

DEFAULT_PARENT_KEY = ndb.Key(datamodel.Place, 'Singapore')
DEFAULT_PARENT_DIST_KEY = ndb.Key(datamodel.Distance, 'Singapre')
API_KEY='AIzaSyAiSOOzgTo9ItnSRQ1TRJI1FHOGJTZg7es'
# Generate Tour Constants
SUITABILITY_GAIN = 50
ESP = 0.5
TOUR_CUTOFF_TIME = datetime.time(22,0)
TOUR_START_TIME = datetime.time(8,0)

