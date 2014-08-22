$(document).ready(function() {
	var map;
	var markers = [];

	// Adding vertical tabs
	$('#menu a').click(function (e) {
		e.preventDefault()
		$(this).tab('show')
	})

	// Animating the tabs when hovered
	$('#menu li').hover(function() {
		$(this).animate({paddingLeft:'10px'}, 200);
	}, function() {
		$(this).animate({paddingLeft: '0px'}, 200);
	});

	// Highlight the tabs when click
	$('#menu a').click(function() {
		$(this).effect("highlight", {color:"grey"}, 1000);
	});

	// Changing date format of calendar
	// Commit: Set basic validation.

	$("#start_datepicker").datetimepicker({
		dateFormat: 'dd/mm/yy',
		timeFormat: 'hh:mm tt',
		minDate: new Date(),
		stepMinute: 5,

		onClose: function(dateText, inst) {
			if ($("#end_datepicker").val() != '') {
				var startDate = $("#start_datepicker").datetimepicker('getDate');
				var endDate = $("end_datepicker").datetimepicker('getDate');
				if (startDate > endDate) {
					$("#end_datepicker").datetimepicker('setDate', startDate);	
				} else {
					// If start_datepicker is filled. User changes the start date
					var mSecsInDay = 86400000;
					var dayDiff = ($('#end_datepicker').datetimepicker('getDate') - 
						$('#start_datepicker').datetimepicker('getDate')) / mSecsInDay + 1;
					$('#inputDuration').val(Math.round(dayDiff)); 
				}
			}
		},
		onSelect: function(selectedDateTime){
			$('#end_datepicker').datetimepicker('option', 'minDate', $('#start_datepicker').datetimepicker('getDate'));
		}
	});

	$("#end_datepicker").datetimepicker({
		dateFormat: 'dd/mm/yy',
		timeFormat: 'hh:mm tt',
		minDate: new Date(),
		stepMinute: 5,

		onSelect: function(selectedDateTime) {
			$('#start_datepicker').datetimepicker('option', 'maxDate', $('#end_datepicker').datetimepicker('getDate'));
		},

		onClose: function(dateText, inst) {
			if ($("#start_datepicker").val() != '') {
				var startDate = $("#start_datepicker").datetimepicker('getDate');
				var endDate = $("end_datepicker").datetimepicker('getDate');
				if (startDate > endDate) {
					$("#start_datepicker").datetimepicker('setDate', endDate);
				}	else {
					// If start_datepicker is filled. User changes the start date
					var mSecsInDay = 86400000;
					var dayDiff = ($('#end_datepicker').datetimepicker('getDate') - 
						$('#start_datepicker').datetimepicker('getDate')) / mSecsInDay + 1;
					$('#inputDuration').val(Math.round(dayDiff)); 
				}
			}
		}
	});

	// Budget Slider
	// ==========================================================================
	var handlers = [25, 50, 75];
	var colors = [
		rgb2hex($("#lodginglbl").css("color")),
		rgb2hex($("#foodlbl").css("color")),
		rgb2hex($("#shoppinglbl").css("color")),
		rgb2hex($("#misclbl").css("color"))
			];
	updateColors(handlers);
	var minWidth = 2;
	var maxVal = 100;
	$("#totalBudget").change(function(){
		updateBudget(handlers);
	});

	$("#budgetSlider").slider({
		min: 0,
		max: maxVal,
		values: handlers,
		slide: function (evt, ui) {
			for (var i=0, l=ui.values.length; i < l; i++){
				if (i !== l - 1 && ui.values[i] > ui.values[i + 1] - minWidth) {
					return false;
				} else if (i === 0 && ui.values[i] < ui.values[i - 1] + minWidth){
					console.log("This should never happen");
					return false;
				} else if (i === 0 && ui.values[i] < minWidth) {
					return false;
				} else if (i === l - 1 && ui.values[i] > maxVal - minWidth) {
					return false;
				}
			}
			updateColors(ui.values);
			updateBudget(ui.values);
		},
		stop: function(event, ui) {
			updateBudget(ui.values);	
		}
	});

	function updateBudget(values) {
		var budget = $("#totalBudget").val();
		if (budget) {
			var vals = [];
			var res = [0]; res = res.concat(values); res.push(maxVal);
			console.log(res);
			for (var i = 0; i < res.length - 1; i++) {
				vals.push(Math.round((res[i+1] - res[i]) * budget / 100));
			}
			// Update budget with rounding.
			$("#lodging").val(vals[0]);
			$("#food").val(vals[1]);
			$("#shopping").val(vals[2]);
			$("#misc").val(vals[3]);
		}
	}
	function updateColors(values) {
		var colorstops = colors[0] + ", "; // start left with the first color
		for (var i=0, l = values.length; i< l; i++) {
			colorstops += colors[i] + " " + values[i] + "%,";
			colorstops += colors[i+1] + " " + values[i] + "%,";
		}
		// end with the last color to the right
		colorstops += colors[colors.length-1];

		/* Safari 5.1, Chrome 10+ */
		var css = '-webkit-linear-gradient(left,' + colorstops + ')';
				$('#budgetSlider').css('background-image', css);
	}
	//====================================================================================

	// Selects the desired pace
	$( "#selectable_pace" ).selectable({
		stop: function() {
			var result = $( "#pace_input" );
			$( ".ui-selected", this ).each(function() {
				result.val($(this).text().toLowerCase());
			});
		}
	});

	$( "#selectable_preference" ).selectable({
		stop: function() {
			var result = $( "#preference_input" );
			$( ".ui-selected", this ).each(function() {
				result.val($(this).text().toLowerCase());
			});
		}
	});


	$("#generate_button").click(function(){
		$('form').submit();
	});

	// Tooltip
	var tooltips = $( "[title]" ).tooltip({
		position: {
			my: "left top",
			at: "right+5 top-5"
		}
	});

	//====================================================================
	$("#place-carousel").owlCarousel({
		items: 3,
		loop: true,
		responsive:{
        0:{
            items:1
        },
        600:{
            items:2
        },            
        960:{
            items:3
        },
        1200:{
            items:3
        }
    },
		nav: true,
		navText: [
			"<span class='glyphicon glyphicon-chevron-left' ></span>",
			"<span class='glyphicon glyphicon-chevron-right'></span>"
		]
	});
	$("#place-carousel").on("mousewheel", '.owl-stage', function (e) {
		if (e.deltaY > 0) {
			$(this).trigger('next.owl');
		} else {
			$(this).trigger('prev.owl');
		}
		e.preventDefault();
	});

	function getPlaceIndex(id) {
		return parseInt(id.split('-', 2)[1]);
	}

	function displayMarker(index) {
		for (var i in markers) markers[i].setMap(null);
		markers[index].setMap(map);
	}
	$(".places").hover(function() {
		displayMarker(getPlaceIndex($(this).attr('id')));
	});

	$(".places").click(function() {
		// Adding marker for active selection
		$(".places").addClass('inactive').removeClass('active');
		$(this).removeClass('inactive').addClass('active');

		// Getting the index of the place being click
		var index = getPlaceIndex($(this).attr("id"));	
		// Display associated marker
		displayMarker(index);

		// Check if it is displayed
		if (!$("#detailPanel").is(":visible")) {
			// Open the detailPanel
			$("#detailPanel").fadeToggle("fast");
		}

		var place = places_list[index];
		// Change title into place name
		$("#headerPanel").html(place.name);	
		// Content
		$("#detailAddress").html(place.address);
		$("#detailOpeningHours").html(place.opening + " - " + place.closing);
		$("#detailDesc").html(place.desc);
	});
	
	$("#displayPanelClose").click(function() {
		$("#detailPanel").fadeToggle("fast");
	});

	/*
	 * Initialise all marker with the same index as place index
	 */
	function initialize() {
		var singapore = new google.maps.LatLng(1.3400, 103.8100);
		var mapOptions = {
			zoom: 11,
			center: singapore
		}
		map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
		
		for (var i in places_list) {
			var place = places_list[i];
			var geo = place.geocode.split(',', 2);
			var loc = new google.maps.LatLng(parseFloat(geo[0]), parseFloat(geo[1]));
			var marker = new google.maps.Marker({
				position: loc,
				title: place.name 
			});
			markers.push(marker);
		}
	}


	function rgb2hex(rgb) {
		if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

		rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	}
	initialize();
});
