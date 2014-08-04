window.onload = function() {
	
	var height = 400,
		width = 400,
		step = 20;
	
	for (var i = 0; i < width; i += step) {
		for (var j = 0; j < height; j += step) {
			// create cells
			$('<div class="cell"></div>').appendTo('#frame')
				.css('width', step + 'px')
				.css('height', step + 'px')
				.css('top', i + 'px')
				.css('left', j + 'px');

			// create dividers
			if (i === 0 && j !== 0) {
				$('<div class="divider"></div>').appendTo('#frame')
					.css('width', '1px')
					.css('height', height + 'px')
					.css('top', '0px')
					.css('left', j + 'px');
			} else if (j === 0 && i !== 0) {
				$('<div class="divider"></div>').appendTo('#frame')
					.css('width', width + 'px')
					.css('height', '1px')
					.css('top', i + 'px')
					.css('left', '0px');					
			}
		}
			
	}
	
	
};