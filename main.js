window.onload = function() {
	var basic_mode = false;
	
	// user properties
	var user_cell_coord,
		max_health = 5,
		health = 5,
		score = 0,
		game_over = false;

	// grid properties
	var height = 400,
		width = 400,
		step = 20;	
			
	// create grid
	for (var i = 0; i < height; i += step) {
		for (var j = 0; j < width; j += step) {
			// create cells			
			$('<div class="cell"></div>').appendTo('#frame')
				.css('width', step + 'px')
				.css('height', step + 'px')
				.css('left', i + 'px')
				.css('top', j + 'px')
				.attr('id', (i/step) + ',' + (j/step));

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
	var state = [], future_state = [], state_history = [];
	for (var i = 0; i < height/step; i++) {
		state[i] = [];
		future_state[i] = [];
		for (var j = 0; j < width/step; j++) {
			state[i][j] = false;
			future_state[i][j] = false;
		}
	}

	
	// set up user interaction
	var spacebarDown = false;
	$(document.body).on('keydown', function(event) {
		if ([32, 37, 38, 39, 40].indexOf(event.which) > -1) event.preventDefault();
		if (basic_mode && event.which === 32) {
			spacebarDown = true;
			
			var setUpdate = function() {
				setTimeout(function() {
					if (spacebarDown) {
						update();
						setUpdate();
					}
				}, 500);
			};
			update();
			setUpdate();			
		}
	});
	$(document.body).on('keyup', function(event) {
		if (!game_over) {
			if (basic_mode) {
				if (event.which === 32) spacebarDown = false;
			} else {
				if (event.which === 32) {
					// spacebar
					clearCellOfUser(user_cell_coord);
					var old_state = update();
					updateUserCell();
					
					// check if periodic state has been reached
					var isPeriodic = false;
					if (state_history.length >= 1 && checkIfEqual(state, state_history[state_history.length - 1])) isPeriodic = true;
					else if (state_history.length >= 4 && checkIfEqual(state, state_history[state_history.length - 2]) && checkIfEqual(state, state_history[state_history.length - 4])) isPeriodic = true;
					else if (state_history.length >= 6 && checkIfEqual(state, state_history[state_history.length - 3]) && checkIfEqual(state, state_history[state_history.length - 6])) isPeriodic = true;
					
					if (isPeriodic) {
						game_over = true;
						var user_cell = $('.user-active');
						user_cell.removeClass(function(index, css) {
							return (css.match(/(^|\s)health-\S+/g) || []).join(' ');
						});
						user_cell.addClass('health-5');
						user_cell.text('');
						noty({text: '<strong>Congratulations! You survived!</strong> <br /> Hit reset to play again', type: 'warning', layout: 'center', timeout: 5000});
					}
				} else if (event.which === 37) {
					// left arrow
					if (user_cell_coord[0] > 0) {
						clearCellOfUser(user_cell_coord);
						user_cell_coord[0]--;
						update();
						updateUserCell();
					}
				} else if (event.which === 38) {
					// up arrow
					if (user_cell_coord[1] > 0) {
						clearCellOfUser(user_cell_coord);
						user_cell_coord[1]--;
						update();
						updateUserCell();
					}
				} else if (event.which === 39) {
					// down arrow
					if (user_cell_coord[0] < state.length - 1) {
						clearCellOfUser(user_cell_coord);
						user_cell_coord[0]++;
						update();
						updateUserCell();
					}			
				} else if (event.which === 40) {
					// right arrow
					if (user_cell_coord[1] < state[0].length - 1) {
						clearCellOfUser(user_cell_coord);
						user_cell_coord[1]++;
						update();
						updateUserCell();
					}			
				}
			}
		}
	});
	$('#basic-tab').click(function() {
		if (!$(this).hasClass('active')) {
			basic_mode = true;
			switchType();
		}
	});
	$('#game-tab').click(function() {
		if (!$(this).hasClass('active')) {
			basic_mode = false;
			switchType();
		}
	});
	
	$('.cell').click(function() {
		if (basic_mode) {
			$(this).toggleClass('active');
			var id = $(this).attr('id').split(',');
			state[id[0]][id[1]] = $(this).hasClass('active');
		}
	});
	$('#step-button').click(function() {
		$(this).blur();
		update();
	});
	$('#randomize-button').click(function() {
		$(this).blur();
		init();
	});
	$('#reset-button').click(function() {
		$(this).blur();
		$.noty.closeAll();
		init();
	});
		

	// core functions	
	var init = function() {
		game_over = false;
		health = max_health;
		score = 0;
		$('#score-text').text('0');
		if (user_cell_coord) clearCellOfUser(user_cell_coord);
		user_cell_coord = [1, 1];
		$('.cell').each(function() {
			var id = $(this).attr('id').split(',');

			// random init
			var isActive = Math.random() < 0.5;
			
			state[id[0]][id[1]] = isActive;
			$(this).toggleClass('active', isActive);
		});		
		updateUserCell();
		if (countNeighbors(user_cell_coord) < 2) init();
	};
	var update = function() {
		state_history.push(copyStateArray(state));
		if (state_history.length === 7) state_history.shift();
		for (var i = 0; i < state.length; i++) {
			for (var j = 0; j < state[i].length; j++) {
				var num_neighbors = countNeighbors([i, j]);				
				if (num_neighbors === 2 || num_neighbors === 3) {
					future_state[i][j] = (state[i][j] === true || num_neighbors === 3);
				} else {
					future_state[i][j] = false;
				}
			}
		}
		state = copyStateArray(future_state);
		setColors();
		score++;
		$('#score-text').text(score);		
	};	
	var setColors = function() {
		// using selector might not be the fastest way
		for (var i = 0; i < state.length; i++) {
			for (var j = 0; j < state[i].length; j++) {
				getCell([i, j]).toggleClass('active', state[i][j]).removeClass('pattern-active');
			}
		}
		if (basic_mode) checkPatterns();
	};
	var getCell = function(coord_array) {
		return $('.cell[id="'+coord_array[0]+','+coord_array[1]+'"]');
	};
	var updateUserCell = function() {
		if (!basic_mode) {
			var user_cell = getCell(user_cell_coord);
			user_cell.removeClass('active');
			user_cell.addClass('user-active');
			state[user_cell_coord[0]][user_cell_coord[1]] = true;
			
			var num_neighbors = countNeighbors(user_cell_coord);
			if (num_neighbors < 2) health--;
			if (num_neighbors > 3 && health < max_health) health++;
			if (health <= 0) {
				user_cell.addClass('health-1');
				game_over = true;
				noty({text: '<strong>You died! =(</strong> <br /> Hit reset to try again', type: 'warning', layout: 'center', timeout: 5000});
				user_cell.text('');
			} else {
				if (health >= 5) user_cell.addClass('health-5');
				else user_cell.addClass('health-' + health);
				user_cell.text(num_neighbors);
			}
		}
	};
	var countNeighbors = function(coord_array) {
		var i = coord_array[0], j = coord_array[1];
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
		return num_neighbors;
	};
	var clearCellOfUser = function(coord_array) {
		var cell = getCell(coord_array);
		cell.removeClass('user-active');
		cell.removeClass(function(index, css) {
			return (css.match(/(^|\s)health-\S+/g) || []).join(' ');
		});
		cell.text('');
	};
	var copyStateArray = function(array) {
		var array_copy = [];
		for (var i = 0; i < array.length; i++) {
			array_copy[i] = [];
			for (var j = 0; j < array[i].length; j++) {
				array_copy[i][j] = array[i][j];
			}
		}
		return array_copy;
	};
	var checkIfEqual = function(array1, array2) {
		var isEqual = true;
		for (var i = 0; i < array1.length; i++) {
			if (isEqual === false) break;
			for (var j = 0; j < array2.length; j++) {
				if (array1[i][j] !== array2[i][j]) {
					isEqual = false;
					break;
				}
			}
		}
		return isEqual;
	};
	var checkPatterns = function() {
		// this function can be written much more efficiently
		// check square shape
		for (var i = 0; i < state.length - 3; i++) {
			for (var j = 0; j < state[i].length - 3; j++) {
				// first check for first row of 4 empty cells
				var isSquare = true;
				var true_states = [[i+1, j+1], [i+1, j+2], [i+2, j+1], [i+2, j+2]];
				var false_states = [[i, j], [i+1, j], [i+2, j], [i+3, j], [i, j+1], [i, j+2], [i, j+3], [i+1, j+3], [i+2, j+3], [i+3, j+3], [i+3, j+2], [i+3, j+1]];
				for (var k = 0; k < true_states.length; k++) {
					var coord = true_states[k];
					if (state[coord[0]][coord[1]] === false) {
						isSquare = false;
						break;
					}
				}
				if (isSquare) {
					for (var k = 0; k < false_states.length; k++) {
						var coord = false_states[k];
						if (state[coord[0]][coord[1]] === true) {
							isSquare = false;
							break;
						}
					}
				}
				
				if (isSquare) {
					// color squares
					var cell_ids_to_color = [(i+1) + ',' + (j+1), (i+1) + ',' + (j+2), (i+2) + ',' + (j+1), (i+2) + ',' + (j+2)];
					for (var k = 0; k < 4; k++) {
						$('.cell[id="'+cell_ids_to_color[k]+'"]').addClass('pattern-active').removeClass('active');
					}
				}				
			}
		}
	};

	// type
	var switchType = function() {
		$('#game-tab, #basic-tab').toggleClass('active');
		$('#step-button, #randomize-button, #reset-button, #game-instruction-list, #basic-instruction-list, #score-container').toggle();
		init();
	};

	
	// executing
	init();
};