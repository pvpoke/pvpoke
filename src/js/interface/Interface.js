// JavaScript Document

var InterfaceMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new interfaceObject();
		
		function interfaceObject(){
				
			var battle;
			var pokeSelectors = [];
			var animating = false;
			var self = this;
			
			var time = 0;
			var timelineInterval;
			
			this.context = "battle";

			this.init = function(){

				var data = GameMaster.getInstance().data;
				// Initialize selectors and push Pokemon data

				$(".poke-select-container .poke").each(function(index, value){
					var selector = new PokeSelect($(this), index);
					pokeSelectors.push(selector);

					selector.init(data.pokemon);
				});
				
				$(".league-select").on("change", selectLeague);
				$(".battle-btn").on("click", startBattle);
				$(".timeline-container").on("mousemove",".item",timelineEventHover);
				$("body").on("mousemove",mainMouseMove);
				$("body").on("mousedown",mainMouseMove);
				
				// Timeline playback
				
				$(".playback .play").click(timelinePlay);
				$(".playback .replay").click(timelineReplay);
				$(".playback-speed").change(timelineSpeedChange);
				
				battle = BattleMaster.getInstance();
				
				// If get data exists, load settings

				this.loadGetData();
				
				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});

			};
			
			// Display HP gven a point in a timeline
			
			this.displayCumulativeDamage = function(timeline, time){
				var cumulativeDamage = [0,0];
				var cumulativeEnergy = [0,0];
				
				for(var i = 0; i < timeline.length; i++){
					var event = timeline[i];
					if(event.time <= time){
						$(".timeline .item[index="+i+"]").addClass("active");

						if((event.type.indexOf("fast") >= 0) || (event.type.indexOf("charged") >= 0)){
							if(event.actor == 0){
								cumulativeDamage[1] += event.values[0];
								cumulativeEnergy[0] += event.values[1];
							} else{
								cumulativeDamage[0] += event.values[0];
								cumulativeEnergy[1] += event.values[1];
							}
						}
					}
				}
				
				for(var n = 0; n < pokeSelectors.length; n++){
					pokeSelectors[n].animateHealth(cumulativeDamage[n]);
					
					for(i = 0; i < pokeSelectors[n].getPokemon().chargedMoves.length; i++){
						pokeSelectors[n].animateEnergy(i, cumulativeEnergy[n]);
					}
					
				}
				
				var left = ((time+1000) / (battle.getDuration()+2000) * 100)+"%";
				$(".timeline-container .tracker").css("left", left);
			}
			
			// Display battle timeline
			
			this.displayTimeline = function(b){
				
				var timeline = b.getTimeline();
				var duration = b.getDuration()+1000;
				
				$(".battle-results").show();
				$(".timeline").html('');
				
				for(var i = 0; i < timeline.length; i++){
					var event = timeline[i];
					var position = ((event.time+1000) / (duration+1000) * 100)+"%";
					
					var $item = $("<div class=\"item-container\"><div class=\"item "+event.type+"\" index=\""+i+"\" name=\""+event.name+"\" values=\""+event.values.join(',')+"\"></div></div>");
					$item.css("left", position);
					
					$(".timeline").eq(event.actor).append($item);
				}
				
				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].update();
				}
				
				// Show battle summary text
				
				var winner = b.getWinner();
				var durationSeconds = Math.floor(duration / 100) / 10;

				if(winner){
					var winnerRating = Math.floor(500 + (500 * (winner.hp / winner.stats.hp)));
					$(".battle-results .summary").html("<span class=\"name\">"+winner.speciesName+"</span> wins in <span class=\"time\">"+durationSeconds+"s</span> with a battle rating of <span class=\"rating star\">"+winnerRating+"</span>");
				} else{
					$(".battle-results .summary").html("Simultaneous knockout in <span class=\"time\">"+durationSeconds+"s</span>");
				}
				
				// Scroll to bottom of page
				
				$("html, body").animate({ scrollTop: $(document).height()-$(window).height() }, 500);
				
				// Animate timelines

				$(".timeline .item").removeClass("active");
				
				var intMs = Math.floor(duration / 62);
				
				self.animateTimeline(-intMs * 15, intMs);
				
				// Generate and display share link
				
				var cp = b.getCP();
				var pokes = b.getPokemon();
				
				var moveStrs = [];
				
				for(var i = 0; i < pokes.length; i++){
					var fastMoveIndex = pokes[i].fastMovePool.indexOf(pokes[i].fastMove);
					var chargedMove1Index = pokes[i].chargedMovePool.indexOf(pokes[i].chargedMoves[0])+1;
					var chargedMove2Index = pokes[i].chargedMovePool.indexOf(pokes[i].chargedMoves[1])+1;
					
					moveStrs.push(fastMoveIndex + "" + chargedMove1Index + "" + chargedMove2Index);
				}
				
				var battleStr = "battle/"+cp+"/"+pokes[0].speciesId+"/"+pokes[1].speciesId+"/"+pokes[0].startingShields+pokes[1].startingShields+"/"+moveStrs[0]+"/"+moveStrs[1]+"/";
				var link = host + battleStr;
				
				$(".share-link input").val(link);
				
				// Push state to browser history so it can be navigated, only if not from URL parameters
				
				if((get)&&(get.p1 == pokes[0].speciesId)&&(get.p2 == pokes[1].speciesId)){
					return;
				}
				
				var url = webRoot+battleStr;
				
				var data = {cp: cp, p1: pokes[0].speciesId, p2: pokes[1].speciesId, s: pokes[0].startingShields+""+pokes[1].startingShields, m1: moveStrs[0], m2: moveStrs[1] };
				
				window.history.pushState(data, "Battle", url);
				
				// Send Google Analytics pageview
				
				gtag('config', UA_ID, {page_location: (host+url), page_path: url});
			}
			
			// Animate timeline playback given a start time and rate in ms
			
			this.animateTimeline = function(startTime, timeRate){
				
				if(animating){
					return false;
				}
								
				animating = true;
				
				clearInterval(timelineInterval);
				
				time = startTime;

				timelineInterval = setInterval(function(){
					time += timeRate;
					
					self.displayCumulativeDamage(battle.getTimeline(), time);

					if(time > battle.getDuration()){
						animating = false;
						clearInterval(timelineInterval);
						
						$(".playback .play").removeClass("active");
					}
				}, 17);
				
			}
			
			// Given JSON of get parameters, load these settings
			
			this.loadGetData = function(){
				
				if(! get){
					return false;
				}
				
				// Cycle through parameters and set them
				
				for(var key in get){
					if(get.hasOwnProperty(key)){
						
						var val = get[key];
						
						// Process each type of parameter
						
						switch(key){
							case "p1":
								pokeSelectors[0].setPokemon(val);
								break;
								
							case "p2":
								pokeSelectors[1].setPokemon(val);
				
								// Auto select moves for both Pokemon

								for(var i = 0; i < pokeSelectors.length; i++){
									pokeSelectors[i].getPokemon().autoSelectMoves();
								}
								break;
								
							case "cp":
								$(".league-select option[value=\""+val+"\"]").prop("selected","selected");
								$(".league-select").trigger("change");
								break;
								
							case "s":
								var arr = val.split('');
								
								for(var i = 0; i < Math.min(arr.length, 2); i++){
									$(".shield-select").eq(i).find("option[value=\""+arr[i]+"\"]").prop("selected", "selected");
									pokeSelectors[i].getPokemon().setShields(arr[i]);
								}
								break;
								
							case "m1":
							case "m2":
								var index = 0;
								
								if(key == "m2"){
									index = 1;
								}
								
								var poke = pokeSelectors[index].getPokemon();
								var arr = val.split('');
								
								var fastMoveId = $(".poke").eq(index).find(".move-select.fast option").eq(parseInt(arr[0])).val();
								poke.selectMove("fast", fastMoveId, 0);
								
								for(var i = 1; i < arr.length; i++){
									var moveId = $(".poke").eq(index).find(".move-select.charged").eq(i-1).find("option").eq(parseInt(arr[i])).val();

									poke.selectMove("charged", moveId, i-1);
								}
								
								break;
						}
					}
					
				}
				
				// Update both Pokemon selectors

				for(var i = 0; i < pokeSelectors.length; i++){
					pokeSelectors[i].update();
				}
					
				// Auto run the battle

				$(".battle-btn").trigger("click");
			}
			
			// Event handler for changing the league select
			
			function selectLeague(e){
				var allowed = [1500, 2500, 10000];
				var cp = parseInt($(".league-select option:selected").val());
				
				if(allowed.indexOf(cp) > -1){
					battle.setCP(cp);
					
					for(var i = 0; i < pokeSelectors.length; i++){
						pokeSelectors[i].setCP(cp);
					}
				}
				
			}
			
			// Run simulation
			
			function startBattle(){
				if((battle.validate())&&(! animating)){
					battle.simulate();
					self.displayTimeline(battle);
				}
			}
			
			// Event handler for timeline hover and click
			
			function timelineEventHover(e){
				
				var $tooltip = $(".tooltip");
				
				$tooltip.show();
				
				$tooltip.attr("class","tooltip");
				$tooltip.find(".name").html($(this).attr("name"));
				$tooltip.addClass($(this).attr("class"));
				$tooltip.find(".details").html('');
			
				if(($(this).hasClass("fast")) || ($(this).hasClass("charged"))){
					
					var values = $(this).attr("values").split(',');
					
					$tooltip.find(".details").html(values[0] + " damage<br>" + values[1] + " energy");
				}
				
				var width = $tooltip.width();
				var left = (e.pageX - $(".section").first().offset().left) + 10;
				var top = e.pageY - 20;
				
				if( left > ($(".timeline-container").width() - width - 10) ){
					left -= width;
				}
				
				$tooltip.css("left",left+"px");
				$tooltip.css("top",top+"px");
			}
			
			// Click play or pause button
			
			function timelinePlay(e){
				$(".playback .play").toggleClass("active");
				
				if(animating){
					clearInterval(timelineInterval);
					
					animating = false;
				} else{
					
					var rate = 17 * parseInt($(".playback-speed option:selected").val());
					
					if(time >= battle.getDuration()){
						self.animateTimeline(0, rate);
					} else{
						self.animateTimeline(time, rate);
					}
				}
			}
			
			// Click replay button
			
			function timelineReplay(e){
				$(".playback .play").addClass("active");
				
				if(animating){
					clearInterval(timelineInterval);
					
					animating = false;
				}
					
				var rate = 17 * parseInt($(".playback-speed option:selected").val());

				self.animateTimeline(0, rate);
			}
			
			// Change playback speed during animation
			
			function timelineSpeedChange(e){
				
				if(animating){
					clearInterval(timelineInterval);
					animating = false;

					var rate = 17 * parseInt($(".playback-speed option:selected").val());

					self.animateTimeline(time, rate);
				}
			}
			
			function mainMouseMove(e){
				if($(".timeline .item:hover").length == 0){
					$(".tooltip").hide();
				}
				
				if(($(".timeline-container:hover").length > 0)&&(! animating)){
					var offsetX = ($(window).width() - $(".timeline-container").width()) / 2;
					var posX = e.clientX - offsetX;
					var hoverTime = ((battle.getDuration()+2000) * (posX / $(".timeline-container").width()))-1000;
					
					time = hoverTime;
					
					self.displayCumulativeDamage(battle.getTimeline(), time);
				}
			}
		};
		
        return object;
    }
 
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();