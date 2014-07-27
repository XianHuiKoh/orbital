from google.appengine.ext import ndb

class Place(ndb.Model):
    """Datastore model to store Place of Attraction:
    Attributes:
        name(String):       Name of place.
        desc(Text):         A brief text description of the place.
        popularity(Float):  A score of how popular the place is. Used in calculation of preference scored.
        image(String):      Name of image stored in static folder /images
        loc_type(String):   Property of a place. Either 'Outdoor', 'Indoor', or 'Both'.
        duration(Int):      (in minute) A suggested duration to spend at a place.
        opening(Int):       (in minute) Opening hours. Absolute minute from 00:00.
        closing(Int):       (in minute) Closing hours. Absolute minute from 00:00.
        
        ---- Preference Score: These scores are multiplier of Popularity. All add up to 1.0 ----
        nature(Float):      Determine how a place is suitable for nature tag.
        shopping(Float):    Determine how a place is suitable for shopping tag.
        culture(Float):     Determine how a place is suitable for culture tag.
        family(Float):      Determine how a place is suitable for family tag.
        romance(Float):     Determine how a place is suitable for romance tag.
        food(Float):        Determine how a place is suitable for food tag.

        ---- TimeOfVisit Score: These scores are 10% bonus multiplier of Popularity. Add add up to 1.0 ----
        night(Float):       How suitable a place is for time from 00:00 to 06:00
        morning(Float):     How suitable a place is for time from 06:00 to 12:00
        afternoon(Float):   How suitable a place is for time from 12:00 to 18:00
        evening(Float):     How suitable a place is for time from 18:00 to 24:00

        ---- Suitability Score: These scores add a fixed bonus for a place. Add 200 score if suitable ----
        handicapped(Boolean):   Determine if a place supports handicapped.
        children(Boolean):      Determine if a place is suitable for children.
        infants(Boolean):       Determine if a place is suitable for infants.
        elderlies(Boolean):     Determine if a place is suitable for elderlies.
    """
    name            = ndb.StringProperty()
    desc            = ndb.TextProperty()
    popularity      = ndb.FloatProperty()
    image           = ndb.StringProperty()
    loc_type        = ndb.StringProperty()
    duration        = ndb.IntegerProperty()
    opening         = ndb.IntegerProperty()
    closing         = ndb.IntegerProperty()

    nature          = ndb.FloatProperty()
    shopping        = ndb.FloatProperty()
    culture         = ndb.FloatProperty()
    family          = ndb.FloatProperty()
    romance         = ndb.FloatProperty()
    food            = ndb.FloatProperty()

    night           = ndb.FloatProperty()
    morning         = ndb.FloatProperty()
    afternoon       = ndb.FloatProperty()
    evening         = ndb.FloatProperty()

    handicapped     = ndb.BooleanProperty()
    children        = ndb.BooleanProperty()
    infants         = ndb.BooleanProperty()
    elderlies       = ndb.BooleanProperty()

    def to_minute(self, time):
        if time:
            hour, minute = (int(d) for d in time.split(':'))
            # Data check
            if hour in xrange(24) and minute in xrange(60):
                return hour * 60 + minute
            else:
                print 'Warning: invalid format for time'
        else:
            return 0
