$(document).ready(function() {
	// Global variable:
	var directionsService = new google.maps.DirectionsService();
	var map;
	var tripRenderer = {};

	// Singapore map
	function initialize() {
		var myLatlng = new google.maps.LatLng(1.3400,103.8100);
  	var mapOptions = {
    	zoom: 12,
    	center: myLatlng
		}
  	map = new google.maps.Map($("#map_canvas").get(), mapOptions);
		
		var content_height = $(window).innerHeight - 200;
		$("#map_canvas").css('height', content_height);
		$("#tourDetails").css('height', content_height);
	}
	
	function calcRoute(options) {
		var from				= options.from; //required
		var to					= options.to; //required
		var depart_time = options.departureTime; //required
		var mode				= google.maps.TravelMode.TRANSIT;

		var start = from.address;
		var end = to.address;
		
		var request = {
			origin: start,
			destination: end,
			travelMode: mode,
			transitOptions: {departureTime: new Date(depart_time)},
			region: "SG" //Regional bias
		};
		
		directionsService.route(request, function (result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				tripRenderer[key] = new google.maps.DirectionsRenderer({directions: result});
			}
		});
	}
	
	function head(x) {return x[0];}
	function tail(x) {return x[1];}
	var routes = head;
	var cutoff = tail;
	var getPlace = head;
	var getTime = tail;

	function readTrip(wholeTrip){
		if (wholeTrip.length == 0) {
			alert("Empty Trip!");
		} else {
			for (var i=0; i < wholeTrip.length; i++) {
				var tour = wholeTrip[i];
				if (routes(tour).length <= 1) {
					alert("Empty Tour!");
				} else {
					var route = routes(tour);
					for (var r=0; r < route.length - 1; r++) {
						var requestOpt = {
							from: getPlace(route[r]),
							to: getPlace(route[r+1]),
							departureTime: getTime(route[r]),
						};
						calcRoute(requestOpt);
					}
				}
			}
		}
	}

	/*
	 * This will create a panel with header as name of palce
	 * Body will be a <a> Details </a> and Time spent there
	 *	
	 * Context:
	 *	"hotel" : blue		=> panel-primary
	 *	"place" : green		=> panel-success
	 *	"cut"		: yellow	=> panel-warning
	 */
	function creatPlacePanel(obj, context) {
		switch(context) {
			case "hotel":	context = "panel panel-primary";
										break;
			case "place": context = "papel panel-success";
										break;
			case "cut": context = "panel panel-sucess";
									break;
			default: context = "panel panel-default";
		}
		var $header = $("<div></div>", 
										{
											"id": "", 
											"class": context,
											"text": obj.name
										});

		var $body = $("<div></div>", 
										{
											"class": "panel-body",
										});
 
		var $content = $("<span></span>",
											{
												"text":"Details:<br>Timing:"
											});
		$body.append($content);
		$header.append($body);
		
		return $header
	}
	
	/*
	 * This function take in an array of tour
	 * Each tour consist of an array of pair[Place/Hotel , Departure time in poUNIX(milliseconds)] 
	 */
	$("#displayPanelClose").click(function() {
		$("#displayPanel").slideToggle();
	}

	function displayRenderer(fr_latlng, to_latlng) {
		
	}

	function displayTrip(wholeTrip) {
		function controlDisplayPanel(render_arr, renderer) {
			// Iterate through all renderer and turn off.
			for (var i=0; i < render_arr.length; i++) {
				render_arr[i].setPanel(null);
			}

			renderer.setPanel($("#displayPanel").get());
			
			if ($("#displayPanel").not(":visible")){
					$("displayPanel").slideToggle();
					// Add a closing button
			}
		}
		
		if (wholeTrip.length == 0) {
			// Display no tour
			// TODO: Display a sorry note, wish if have a longer stay. Show buttons to redirect to 
			// either Planner page or discover Attractions page
		}
		
		for (var tour=0; tour < wholeTrip.length; tour++){
			// Adding tour information to div#tour$
			// For each place, create a pannel
			// Make all the content display:none
			
			// Checking if tour is technically valid
			if (routes(tour).length == 1) { // Only contain hotel
				// TODO: Display information: Like expanding database. Show buttons to redirect to
				// ether Planner page or discover Attractions page
			} else {
				// Adding element into div#tour$
					var $tourDiv = $("#tour" + tour);
						
				// First add hotel
				$tourDiv.append(createPlacePanel(tour[0], "hotel"));
				for (var rout=0; rout < routes(tour).length; rout++){
					// Append a hyperlink of route detail.
					// Then a place
					var opt = {
						href: "",
						click: function(
					};
					var $direction = $("<a></a>",
					
				}
			}
		}

		function directionsRenderer
	}
	// Setting initial height
	
	$( window ).resize(function() {
		var content_height = $( window ).innerHeight - 200;
		$("#map_canvas").css('height', content_height);
		$("#tourDetails").css('height', content_height);
	});
	
	$( "#prevDay" ).click(function() {
		alert("PrevDay is clicked");

	});
	initialize();
	//google.maps.event.addDomListener(window, 'load', initialize);
});
