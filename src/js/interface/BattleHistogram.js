// This class outputs a Battle Rating histogram to the tied Jquery object

function BattleHistogram($element){

	var $el = $element;
	var divisions = 20;
	var increment = 1000 / divisions; // Max Battle Rating of 1000, so divide that into equal chunks

	var currentData;
	var previousData;

	// Animate a previous or current histogram

	$el.on("click", ".button", function(e){

		var data = previousData;

		if($(e.target).hasClass("current")){
			data = currentData;

			$(e.target).html("See Previous: " + previousData.name);
		} else{
			$(e.target).html("See Current: " + currentData.name);
		}

		$(e.target).toggleClass("current");
		$(e.target).toggleClass("previous");

		$el.find("h2").html(data.name);
		$el.find(".move-label").html(data.moves);
		$el.find(".br-avg").html(data.avg);

		// Set stats

		for(var i = 0; i < data.stats.length; i++){
			var percent = Math.round((data.stats[i] / data.total) * 1000) / 10;

			$el.find(".stats .stat").eq(i).html(data.stats[i]);
			$el.find(".stats .percent").eq(i).html(percent);
		}

		// Animate each bar

		for(var i = 0; i < data.bars.length; i++){
			$el.find(".bar").eq(i).css("height", data.bars[i]+"%");
		}
	});

	this.generate = function(pokemon, ratings, scaleOverride){

		// Store previous data

		if(currentData){
			previousData = currentData; // Save previous for comparison
		}

		var histogramCounts = []; // Stores the number of matchups in each bracket

		for(var i = 0; i < divisions; i++){
			histogramCounts.push(0);
		}

		// Bucket individual battle ratings into the histogram segments

		var stats = [0,0,0];
		var statLabels = ["Wins","Losses","Draws"];
		var avg = 0;

		for(var n = 0; n < ratings.length; n++){
			var division = Math.ceil(ratings[n] / increment) - 1; // Ensures a range of 0 to the number of divisions

			histogramCounts[division]++;
			avg += ratings[n];

			if(ratings[n] > 500){
				stats[0]++;
			} else if(ratings[n] < 500){
				stats[1]++;
			} else if(ratings[n] == 500){
				stats[2]++;
			}
		}

		avg = Math.round(avg / ratings.length);

		// Generate list of moves so it can be referenced above the chart

		var moveStr = pokemon.fastMove.name;

		for(var i = 0; i < pokemon.chargedMoves.length; i++){
			moveStr += ", " + pokemon.chargedMoves[i].name;
		}

		var $histogram = $("<div><h2>"+pokemon.speciesName+"</h2><div class=\"move-label\">"+moveStr+"</div><div class=\"chart\"></div><div class=\"x-axis\"><div>0</div><div>500</div><div>1000</div></div><div class=\"label label-y-axis\">Battle Rating (Avg: <span class=\"br-avg\">500</span>)</div><div class=\"label-x-axis\">Matches</div><div class=\"button previous\">See Previous</div><div class=\"stats\"></div></div>");

		var scale = Math.floor(ratings.length / 4);

		if(scaleOverride){
			scale = scaleOverride;
		}

		var winColors = [
			[93,71,165],
			[0,143,187]
		]; // rgb
		var lossColors = [
			[186,0,143],
			[93,71,165]
		]; // rgb

		if(settings.colorblindMode){
			winColors = [
				[59,113,227],
				[26,133,255]
			]; // rgb

			lossColors = [
				[212,17,89],
				[178,39,120]
			]; // rgb
		}

		var barHeights = [];

		for(var n = 0; n < histogramCounts.length; n++){
			var height = (histogramCounts[n] / scale) * 100;
			var width = 100 / divisions;
			var $segment = $("<div class=\"segment\"><div class=\"bar\"></div></div>");

			barHeights.push(height);

			$segment.css("width", width+"%");
			$segment.find(".bar").css("height", height+"%");

			// Apply a gradient to bar color
			var colors = (n <= histogramCounts.length / 2) ? lossColors : winColors;
			var color = [ colors[0][0], colors[0][1], colors[0][2] ];

			for(var j = 0; j < color.length; j++){
				var range = colors[1][j] - color[j];
				var base = color[j];
				var ratio = (n / (histogramCounts.length / 2));

				if(ratio > 1){
					ratio -= 1;
				}

				color[j] = Math.floor(base + (range * ratio));
			}

			$segment.find(".bar").css("background", "rgb("+color[0]+","+color[1]+","+color[2]+")");

			$histogram.find(".chart").append($segment);

			if(previousData){
				$histogram.find(".button").html("See Previous: " + previousData.name);
				$histogram.find(".button").css("display","block");
			}
		}

		// Add stat info

		for(var i = 0; i < stats.length; i++){
			var statPercent = Math.round((stats[i] / ratings.length) * 1000) / 10;

			$histogram.find(".stats").append("<div><b>"+statLabels[i]+": </b><span class=\"stat\">"+stats[i]+"</span> (<span class=\"percent\">"+statPercent+"</span>%)"+"</div>")
		}

		$histogram.find(".br-avg").html(avg);

		$el.html($histogram);


		// Store histogram for later comparison

		currentData = {
			name: pokemon.speciesName,
			moves: moveStr,
			bars: barHeights,
			stats: stats,
			total: ratings.length,
			avg: avg
		};
	}

}
