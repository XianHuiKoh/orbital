$(document).ready(function() {

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
	
	/*
	// Implementing sliders for budgets
	$("#slider-lodging").slider({
		range: "min",
		value: 10,
		min: 1,
		max: 10000,
		slide: function( event, ui ) {
			$( "#lodging" ).val( "$" + ui.value );
			
			// Update Total Budget accordingly
			$( '#total-budget' ).html(	ui.value +
														$('#slider-fb').slider('value') +
														$('#slider-shopping').slider('value') +
														$('#slider-misc').slider('value') );
		}
	});

	$( "#lodging" ).val( "$" + $( "#slider-lodging" ).slider( "value" ) );

	$("#slider-fb").slider({
		range: "min",
		value: 10,
		min: 1,
		max: 10000,
		slide: function( event, ui ) {
			$( "#fb" ).val( "$" + ui.value );
			
			// Update Total Budget accordingly
			$( '#total-budget' ).html(	ui.value +
														$('#slider-lodging').slider('value') +
														$('#slider-shopping').slider('value') +
														$('#slider-misc').slider('value') );
		}
	});

	$( "#fb" ).val( "$" + $( "#slider-fb" ).slider( "value" ) );

	$("#slider-shopping").slider({
		range: "min",
		value: 10,
		min: 1,
		max: 10000,
		slide: function( event, ui ) {
			$( "#shopping" ).val( "$" + ui.value );
			
			// Update Total Budget accordingly
			$( '#total-budget' ).html(	ui.value +
														$('#slider-lodging').slider('value') +
														$('#slider-fb').slider('value') +
														$('#slider-misc').slider('value') );

		}
	});

	$( "#shopping" ).val( "$" + $( "#slider-shopping" ).slider( "value" ) );

	$("#slider-misc").slider({
		range: "min",
		value: 10,
		min: 1,
		max: 10000,
		slide: function( event, ui ) {
			$( "#misc" ).val( "$" + ui.value );

			// Update Total Budget accordingly
			$( '#total-budget' ).html(	ui.value +
														$('#slider-lodging').slider('value') +
														$('#slider-shopping').slider('value') +
														$('#slider-fb').slider('value') );

		}
	});

	$( "#misc" ).val( "$" + $( "#slider-misc" ).slider( "value" ) );

	function update_budget() {
		$( '#total-budget' ).html(	$('#slider-lodging').slider('value') +
				$('#slider-fb').slider('value') +
				$('#slider-shopping').slider('value') +
				$('#slider-misc').slider('value') );
	}

	update_budget();

	// If slider input is changed, update the corresponding slider
	$('.slider-val').change(function () {
		var value = this.value.substring(1);
		$('#slider-' + $(this).attr('id')).slider('value', parseInt(value));
		update_budget();
	});
*/
		// Budget Slider
		// ==========================================================================
		var handlers = [25, 50, 75];
		console.log(rgb2hex($("#lodging").css("backgroundColor")));
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
			console.log(budget);
			if (budget) {
				var vals = [];
				var res = [0]; res = res.concat(values); res.push(maxVal);
				console.log(res);
				for (var i = 0; i < res.length - 1; i++) {
					vals.push(Math.round((res[i+1] - res[i]) * budget / 100));
				}
				console.log(values);	
				console.log(vals);
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

	// Singapore map
	function initialize() {
  		var myLatlng = new google.maps.LatLng(1.3400,103.8100);
  		var mapOptions = {
    		zoom: 11,
    		center: myLatlng
  		}
  		var map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  		// Esplanade marker
  		var esplanadeLatlng = new google.maps.LatLng(1.2894, 103.8570);

  		var esplanademarker = new google.maps.Marker({
      		position: esplanadeLatlng,
     		map: map,
      		title: 'Esplanade - Theatres on the Bay',
      		animation: google.maps.Animation.DROP
  		});

  		// Singapore Botanic Garden marker
  		var botanicLatlng = new google.maps.LatLng(1.3139, 103.8161);

  		var botanicmarker = new google.maps.Marker({
      		position: botanicLatlng,
      		map: map,
      		title: 'Singapore Botanic Garden',
      		animation: google.maps.Animation.DROP
  		});

  		// Gardens by the Bay marker
  		var gardensbythebayLatlng = new google.maps.LatLng(1.2815, 103.8636);

  		var gardensbythebaymarker = new google.maps.Marker({
     		position: gardensbythebayLatlng,
      		map: map,
      		title: 'Gardens by the Bay',
      		animation: google.maps.Animation.DROP
  		});

  		// Zoo marker
  		var zooLatlng = new google.maps.LatLng(1.4045, 103.7929);

  		var zoomarker = new google.maps.Marker({
      		position: zooLatlng,
      		map: map,
      		title: 'Singapore Zoo',
      		animation: google.maps.Animation.DROP
  		});

  		// Flyer marker
  		var flyerLatlng = new google.maps.LatLng(1.2893, 103.8632);

  		var flyermarker = new google.maps.Marker({
      		position: flyerLatlng,
      		map: map,
      		title: 'Singapore Flyer',
      		animation: google.maps.Animation.DROP
  		});

  		// Asian Civilations Museum marker
  		var asiancivilationsmuseumLatlng = new google.maps.LatLng(1.2874, 103.8515);

  		var asiancivilationsmuseummarker = new google.maps.Marker({
      		position: asiancivilationsmuseumLatlng,
      		map: map,
      		title: 'Asian Civilations Museum',
      		animation: google.maps.Animation.DROP
  		});

  		// Wild Wild Wet marker
  		var wildwildwetLatlng = new google.maps.LatLng(1.3775, 103.9541);

  		var wildwildwetmarker = new google.maps.Marker({
      		position: wildwildwetLatlng,
      		map: map,
      		title: 'Wild Wild Wet',
      		animation: google.maps.Animation.DROP
  		});

  		// Helix Bridge marker
  		var helixbridgeLatlng = new google.maps.LatLng(1.2873, 103.8605);

  		var helixbridgemarker = new google.maps.Marker({
      		position: helixbridgeLatlng,
      		map: map,
      		title: 'The Helix Bridge',
      		animation: google.maps.Animation.DROP
  		});
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
