from google.appengine.ext import ndb
import datamodel
import datetime

DEFAULT_PARENT_KEY = ndb.Key(datamodel.Place, 'Singapore')
DEFAULT_PARENT_DIST_KEY = ndb.Key(datamodel.Distance, 'Singapre')
#API_KEY='AIzaSyBknl5aL0ailWpAYopc6BP-xFOWB74N9rE'
#API_KEY='AIzaSyC9aPbFV6oOw9gvbnxAy5Xd6OWtaSLJcw8'
API_KEY='AIzaSyCFhWAzpQt-xkrGMxrFPXItgcIt2-sFJsg'
# Generate Tour Constants
SUITABILITY_GAIN = 50
ESP = 0.5
TOUR_CUTOFF_TIME = datetime.time(22,0)
TOUR_START_TIME = datetime.time(8,0)

