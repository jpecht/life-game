window.onload = function() {
	
	// create grid
	var height = 400,
		width = 400,
		step = 20;	
	
	for (var i = 0; i < height; i += step) {
		for (var j = 0; j < width; j += step) {
			// create cells
			$('<div class="cell"></div>').appendTo('#frame')
				.css('width', step + 'px')
				.css('height', step + 'px')
				.css('left', i + 'px')
				.css('top', j + 'px')
				.attr('id-x', i)
				.attr('id-y', j);

			// create dividers
			if (i === 0 && j !== 0) {
				$('<div class="divider"></div>').appendTo('#frame')
					.css('width', width + 'px')
					.css('height', '1px')
					.css('top', j + 'px')
					.css('left', '0px');					
			} else if (j === 0 && i !== 0) {
				$('<div class="divider"></div>').appendTo('#frame')
					.css('width', '1px')
					.css('height', height + 'px')
					.css('top', '0px')
					.css('left', i + 'px');
			}
		}
			
	}
	
	// set up state variables
	var state = [], future_state = [];
	for (var i = 0; i < height/step; i++) {
		state[i] = [];
		future_state[i] = [];
		for (var j = 0; j < width/step; j++) {
			state[i][j] = false;
			future_state[i][j] = false;
		}
	}

	
	// set up user interaction
	$('.cell').click(function() {
		$(this).toggleClass('active');
	});
	$('#step-button').click(function() {
		update();
	});


	// core functions	
	var init = function() {
		$('.cell').each(function() {
			var isActive = Math.random() < 0.5;
			var idx = $(this).attr('id-x');
			var idy = $(this).attr('id-y');
			state[idx][idy] = isActive;
			$(this).toggleClass('active', isActive);
		});
	}
	var update = function() {
		for (var i = 0; i < state.length; i++) {
			for (var j = 0; j < state[i].length; j++) {
				var cell = state[i][j];
				var num_neighbors = 0;
				if (i !== 0) {
					if (j !== 0 && state[i-1][j-1]) num_neighbors++;
					if (state[i-1][j]) num_neighbors++;
					if (j !== state[i].length - 1 && state[i-1][j+1]) num_neighbors++;
				}
				if (j !== 0 && state[i][j-1]) num_neighbors++;
				if (j !== state[i].length - 1 && state[i][j+1]) num_neighbors++;
				if (i !== state.length - 1) {
					if (j !== 0 && state[i+1][j-1]) num_neighbors++;
					if (state[i+1][j]) num_neighbors++;
					if (j !== state[i].length - 1 && state[i+1][j+1]) num_neighbors++;
				}
				
				if (num_neighbors === 2 || num_neighbors === 3) {
					future_state[i][j] = (state[i][j] === true || num_neighbors === 3);
				} else {
					future_state[i][j] = false;
				}
			}
		}
		state = future_state;
		setColors();
	};	
	var setColors = function() {
		// using selector might not be the fastest way
		for (var i = 0; i < state.length; i++) {
			for (var j = 0; j < state[i].length; j++) {
				$('div[id-x='+i+'][id-y='+j+']').toggleClass('active', state[i][j]);
			}
		}
	};
	
	
	// executing
	init();

};