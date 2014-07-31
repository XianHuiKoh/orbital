$(document).ready(function() {
	// Global variable:
	
	// Singapore map
	function initialize() {
		var myLatlng = new google.maps.LatLng(1.3400,103.8100);
  	var mapOptions = {
    	zoom: 12,
    	center: myLatlng
		}
  	var map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
		
		var content_height = $(window).innerHeight - 200;
		$("#map_canvas").css('height', content_height);
		$("#tourDetails").css('height', content_height);
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
	//initialize();
	//google.maps.event.addDomListener(window, 'load', initialize);
});
