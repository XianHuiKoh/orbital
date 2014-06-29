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
	$('#start_datepicker').datepicker({
		dateFormat:'dd/mm/yy',
		minDate: new Date(),
		maxDate: '+2y',
		onSelect: function(dateText, inst) {
			$('#end_datepicker').datepicker('option','minDate',
				$('#start_datepicker').datepicker('getDate'));


			// If end_datepicker is filled. User changes the start date
			if ($('#end_datepicker').datepicker('getDate') == 0 ||
				$('#end_datepicker').datepicker('getDate') != null) {
					var mSecsInDay = 86400000;
					var dayDiff = ($('#end_datepicker').datepicker('getDate') - 
						$('#start_datepicker').datepicker('getDate')) / mSecsInDay + 1;
					$('#inputDuration').val(dayDiff); 
				}
		}
	});

	$("#end_datepicker").datepicker({
		dateFormat:'dd/mm/yy',
		minDate: new Date(),
		onSelect: function() {
			var mSecsInDay = 86400000;
			var dayDiff = ($('#end_datepicker').datepicker('getDate') - 
				$('#start_datepicker').datepicker('getDate')) / mSecsInDay + 1;
			$('#inputDuration').val(dayDiff); 
		}
	});

	// Implementing sliders for budgets
	$("#slider-lodging").slider({
		range: "min",
		value: 10,
		min: 1,
		max: 10000,
		slide: function( event, ui ) {
			$( "#lodging" ).val( "$" + ui.value );
		}
	});

	$( "#lodging" ).val( "$" + $( "#slider-lodging" ).slider( "value" ) );

	$("#slider-food").slider({
		range: "min",
		value: 10,
		min: 1,
		max: 10000,
		slide: function( event, ui ) {
			$( "#fb" ).val( "$" + ui.value );
		}
	});

	$( "#fb" ).val( "$" + $( "#slider-food" ).slider( "value" ) );

	$("#slider-shopping").slider({
		range: "min",
		value: 10,
		min: 1,
		max: 10000,
		slide: function( event, ui ) {
			$( "#shopping" ).val( "$" + ui.value );
		}
	});

	$( "#shopping" ).val( "$" + $( "#slider-shopping" ).slider( "value" ) );

	$("#slider-misc").slider({
		range: "min",
		value: 10,
		min: 1,
		max: 10000,
		slide: function( event, ui ) {
			$( "#miscellaneous" ).val( "$" + ui.value );
		}
	});

	$( "#miscellaneous" ).val( "$" + $( "#slider-misc" ).slider( "value" ) );

	// Selects the desired pace
	$( "#selectable_pace" ).selectable({
		stop: function() {
			var result = $( "#select-result" ).empty();
			$( ".ui-selected", this ).each(function() {
				var index = $( "#selectable li" ).index( this );
				result.append( " #" + ( index + 1 ) );
			});
		}
	});

	$( "#selectable_style" ).selectable({
		stop: function() {
			var result = $( "#select-result" ).empty();
			$( ".ui-selected", this ).each(function() {
				var index = $( "#selectable li" ).index( this );
				result.append( " #" + ( index + 1 ) );
			});
		}
	});
});



