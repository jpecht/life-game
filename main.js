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
	
	// user properties
	var user_cell_coord,
		max_health = 5,
		health = 5,
		score = 0,
		game_over = false;

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
	$(document.body).on('keyup', function(event) {
		if (!game_over) {
			if (event.which === 32) {
				// spacebar
				clearCellOfUser(user_cell_coord);
				var old_state = update();
				updateUserCell();
				if (checkIfEqual(state, old_state)) {
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
	});
	$('#reset-button').click(function() {
		$.noty.closeAll();
		init();
		score = 0;
		$('#score-text').text('0');
	});

	// core functions	
	var init = function() {
		game_over = false;
		health = max_health;
		if (user_cell_coord) clearCellOfUser(user_cell_coord);
		user_cell_coord = [1, 1];
		$('.cell').each(function() {
			var id = $(this).attr('id').split(',');

			// random init
			var isActive = Math.random() < 0.5;

			// three by three init
			//var isActive = (id[0] >= 9 && id[0] <= 11 && id[1] >= 9 && id[1] <= 11);
			
			state[id[0]][id[1]] = isActive;
			$(this).toggleClass('active', isActive);
		});		
		updateUserCell();
		//if (countNeighbors(user_cell_coord) < 2) init();
	};
	var update = function() {
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
		var old_state = copyStateArray(state);
		state = copyStateArray(future_state);
		setColors();
		score++;
		$('#score-text').text(score);
		return old_state;
	};	
	var setColors = function() {
		// using selector might not be the fastest way
		for (var i = 0; i < state.length; i++) {
			for (var j = 0; j < state[i].length; j++) {
				getCell([i, j]).toggleClass('active', state[i][j]);
			}
		}
	};
	var getCell = function(coord_array) {
		return $('.cell[id="'+coord_array[0]+','+coord_array[1]+'"]');
	};
	var updateUserCell = function() {
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
	}
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
	}

	
	// executing
	init();
};