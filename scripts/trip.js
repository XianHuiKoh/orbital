$(document).ready(function() {
	// Global variable:
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer({markerOptions: {visible: false}});
	var map;
	var panel = $("#displayPanel")[0];
	var currentTour;
	//var tourNum;
	//var wholeTrip;
	var markers = [];
	var defaultCenter = new google.maps.LatLng(1.3400,103.8100);
	var defaultZoom = 11;

	// Singapore map
	function initialize() {
  	var mapOptions = {
    	zoom: defaultZoom,
    	center: defaultCenter
		}
  	map = new google.maps.Map($("#map_canvas")[0], mapOptions);
		markers = [];
		initializeTrip();

	}
	

	function calcRoute(from, to, depart_time) {
		var start				= from.address; //required
		var end					= to.address; //required
		var mode				= google.maps.TravelMode.TRANSIT;

		var request = {
			origin: start,
			destination: end,
			travelMode: mode,
			transitOptions: {departureTime: new Date(depart_time)},
			region: "SG" //Regional bias
		};
		
		directionsService.route(request, function (result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(result);
				directionsDisplay.setMap(map);
				directionsDisplay.setPanel(panel);

			}
		});
	}
	
	function strToMilliseconds(txt) {
		/* Convert from 00:00 to seconds
		 */
		txt = txt.split(":");
		var hours = txt[0];
		var mins = txt[1];
		return (parseInt(hours) * 3600 + parseInt(mins) * 60) * 1000;
	}

	function millisecondsToTxt(millsecs) {
		var secs = Math.round(millsecs / 1000);
		var h = Math.floor(secs / 3600);
		var m = Math.ceil((secs % 3600) / 60) ;

		var result = "";
		if (h > 1) {
			result = result + h + " hrs ";
		} else if (h == 1) {
			result = result + h + " hr ";
		}

		if (m > 1) {
			result = result + m + " mins ";
		} else if (m == 1) {
			result = result + m + " min ";
		}

		return result;
	}

	function initializeTrip() {
		if (wholeTrip.length == 0) {
			// TODO: Saying trip is too short. Do something then return
			console.log("Trip is too short");
			return;
		}

		for (var i = 0; i < wholeTrip.length; i++) {
			var tour = wholeTrip[i][0];
			var cutoff = wholeTrip[i][1];
			console.log(cutoff);
			var $tour = $("#tour"+i);
			//$tour.css("visibility", "hidden");

			if (tour.length <= 1) {
				// TODO: Saying that we are expanding our database. Your stay is too long.
				// Do something then continue
				var msg = "We are expanding our database for more places. We seek for your understanding";
				var $content = $("<div></div>", {text:msg, class:"text-center"});
				$tour.append($content);
				continue;
			}

			// CreatePanel for hotel
			// Render once for hotel
			for (var j = 0; j < tour.length - 1; j++) {
				var from				= tour[j][0];
				var fr_time			= tour[j][1];
				var to					= tour[j + 1][0];
				var to_time			= tour[j + 1][1];
				
				var context;
				var travel_time = to_time - fr_time - strToMilliseconds(to.duration);

				console.log("Place number: " + j);
				
				
				if (j == 0) {
					context = "hotel";
					$tour.append(createPanel(context, from, to, fr_time, travel_time));
				} 
				
				context = (cutoff >= 0 && j >= cutoff - 1) ? "cut" : "place";
				$tour.append(createPanel(context, from, to, fr_time, travel_time));
			}
		}
		
		// Initialize some default
		currentTour = 0;
		displayTour(0);
		if (wholeTrip.length == 1) {
			// Disable both button
			$("#nextButt").attr("disabled", true);
		}
		$("#prevButt").attr("disabled", true);
	}
		
	function createPanel(context, from, to, depart_time, travel_time) {
		var wrapper;
		switch(context) {
			case "hotel":	wrapper = "panel panel-primary";
										break;
			case "place": wrapper = "panel panel-success";
										break;
			case "cut": wrapper = "panel panel-danger";
									break;
			default: wrapper = "panel panel-default";
		}
		var $div = $("<div></div>", {"class": "text-center"});
		var obj;
		var timing = "";
		var arrival_dt;

		console.log(context);
		if (context != "hotel") {
			// Create travel link
			var $travelLink = $("<a></a>", 
					{
						text: "By public transport: " + millisecondsToTxt(travel_time),
						click: function() {
							// Render tour and display
							var request = $(this).data("request");
							renderDisplay(request.from, request.to, request.depart_time);
						}
					});
			$travelLink.data("request", {"from": from, "to": to, "depart_time": depart_time});
			$div.append($("<br/>"));
			$div.append($travelLink);
			$div.append($("<br/><br/>"));

			
			obj = to;
			arrival_dt = new Date(depart_time + travel_time);
			timing = "From ";
			timing = timing + arrival_dt.getHours() + ":" + arrival_dt.getMinutes();
			timing = timing + " to ";
			
			arrival_dt = new Date(arrival_dt.valueOf() + strToMilliseconds(obj.duration));
			timing = timing + arrival_dt.getHours() + ":" + arrival_dt.getMinutes();
			
		} else {
			obj = from;
			arrival_dt = new Date(depart_time);
			timing = "Departure at " + arrival_dt.getHours() + ":" + arrival_dt.getMinutes();
		}

		// Create panel
		var $panelDiv = $("<div></div>", { "class": wrapper	});
		var $panelHeader = $("<div></div>",{ "class": "panel-heading" });
		var $panelTitle = $("<h3></h3>", 
				{
					html: "<strong>" + obj.name + "</strong>",
					"class": "panel-title"
				});

		var $panelBody = $("<div></div>", 
				{
					"class": "panel-body",
					text: timing
				});

		$panelHeader.append($panelTitle);
		$panelDiv.append($panelHeader);
		$panelDiv.append($panelBody);

		$div.append($panelDiv);
		return $div;
	}

	function renderDisplay(from, to, depart_time) {
		// Check if direction panel is open. If not open it
		if (!($("#directionPanel").is(":visible"))) {
			$("#directionPanel").slideToggle();
		}
		calcRoute(from, to, depart_time);
	}

	/*
	 * This function take in an array of tour
	 * Each tour consist of an array of pair[Place/Hotel , Departure time in poUNIX(milliseconds)] 
	 */
	
	

	function setAllMap(map) {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}
	}

	function clearMarkers() {
		setAllMap(null);
	}

	function showMarkers() {
		setAllMap(map);
	}

	function deleteMarkers() {
		clearMarkers();
		markers = [];
	}
	
	function nextTour() {
		if (currentTour + 1 >= tourNum - 1) {
			$("#nextButt").attr("disabled", true);
		}
		$("#prevButt").removeAttr("disabled");
		displayTour(currentTour + 1);
	}

	function prevTour() {
		if (currentTour - 1 <= 0) {
			$("#prevButt").attr("disabled", true);
		}
		$("#nextButt").removeAttr("disabled");
		displayTour(currentTour - 1);
	}

	function displayTour(num) {
		reset();

		// Change header
		$("#tourHeader").text("Day " + (num + 1));
		// Toggle Display window
		$("#tour"+num).fadeIn("medium");
		//$("#tour"+num).fadeIn("fast");

		// Put marker of places
		var tour = wholeTrip[num][0];
		var cutoff = wholeTrip[num][1];
		for (var i = 0; i < tour.length; i++){
			var place = tour[i][0];
			var latlng = place.geocode.split(",");
			var marker = new google.maps.Marker({
					position: new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1])),
					title: place.name,
					animation: google.maps.Animation.DROP,
					opacity: 0.8
			});

			markers.push(marker);
		}

		showMarkers();
		// Set current tour
		currentTour = num;
	}
	
	function reset() {
		// Reset everything
		$(".routes").css("display", "none");
		deleteMarkers();
		directionsDisplay.setMap(null);
		closeDirectionPanel();
	
		resetMap();
	}
	function resetMap() {
		map.setCenter(defaultCenter);
		map.setZoom(defaultZoom);
	}

	function closeDirectionPanel() {
		if ($("#directionPanel").is(":visible")) {
			$("#directionPanel").slideToggle();
		}
	}

	$("#displayPanelClose").click(function() {
		$("#directionPanel").slideToggle();
	});
	
	$("#prevButt").click(function() {
		prevTour();
	});

	$("#nextButt").click(function() {
		nextTour();
	});

	initialize();
	//google.maps.event.addDomListener(window, 'load', initialize);
});
