// JavaScript Document

var InterfaceMaster = (function () {
    var instance;
 
    function createInstance() {
		
		
        var object = new interfaceObject();
		
		function interfaceObject(){
				
			var battle;
			var ranker = RankerMaster.getInstance();
			var pokeSelectors = [];
			var animating = false;
			var self = this;
			
			// Filter lists			
			var filterLists = [
				[],
				[]
			]; // 0 - include, 1 - exclude

			this.init = function(){

				var data = GameMaster.getInstance().data;
				
				$(".league-select").on("change", selectLeague);
				$(".simulate").on("click", startRanker);
				$(".add-filter").on("click", addFilter);
				$("body").on("change", ".filter-type", changeFilterType);
				
				battle = new Battle();
			};
			
			// Update the displayed filters
			
			this.updateFilterDisplay = function(){
				$(".filters").each(function(index, value){
					var $el = $(this);
					var filters = filterLists[index];
					
					if(filters.length > 0){
						$el.html("");
						
						for(var i = 0; i < filters.length; i++){
							var $filter = $(".filter.clone").clone();
							$filter.removeClass("hide clone");
							$filter.attr("index", i);
							$filter.find("a.toggle .name").html(filters[i].name);
							
							$el.append($filter);
						}
					} else{
						$el.html("<p>No filters yet.</p>")
					}
					
				});
			}
			
			// Add a new filter to the include or exclude settings
			
			function addFilter(e){
				var listIndex = parseInt($(e.target).attr("list-index"));
				var filters = filterLists[listIndex];
				
				// Add a new filter
				
				filters.push({
					filterType: "type",
					name: "Type",
					values: []
				});
				
				self.updateFilterDisplay();
			}
			
			// Change the type of a filter
			
			function changeFilterType(e){
				var $el = $(e.target).closest(".filter");
				var listIndex = $(e.target).closest(".filters").attr("list-index");
				var filter = filterLists[listIndex][parseInt($el.attr("index"))];
				var selectedType = $(e.target).find("option:selected").val();
				var selectedName = $(e.target).find("option:selected").html();
				
				filter.filterType = selectedType;
				filter.name = selectedName;
				
				self.updateFilterDisplay();
			}
			
			// Event handler for changing the league select
			
			function selectLeague(e){
				var allowed = [1500, 2500, 10000];
				var cp = parseInt($(".league-select option:selected").val());
				
				if(allowed.indexOf(cp) > -1){
					battle.setCP(cp);
				}
				
			}
			
			// Run simulation
			
			function startRanker(){				
				ranker.rankLoop(battle.getCP(), battle.getCup());
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