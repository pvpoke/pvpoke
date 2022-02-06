/*
* Interface functionality for move list and explorer
*/

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var data;
			var gm = GameMaster.getInstance();
			var checklist = [];
			var priorities = ["Priority", "Nice to Have", "Extra Mile"]

			this.init = function(){
				// Load checklist from JSON
				var file = webRoot+"articles/community-day/data/"+articleId+".json?v="+siteVersion;

				$.getJSON( file, function( d ){
					console.log("article checklist loaded");

					data = d;
					checklist = data.checklist;

					self.displayChecklist(checklist);
				});
			};

			// Given a checklist, display it in the article
			this.displayChecklist = function(list, sort){
				sort = typeof sort !== 'undefined' ? sort : "priority";

				list.sort((a,b) => (a[sort] > b[sort]) ? 1 : ((b[sort] > a[sort]) ? -1 : 0));

				$(".cd-checklist").html("");

				for(var i = 0; i < list.length; i++){
					var item = list[i];
					var $el = $(".checklist-item.template").clone().removeClass("template");

					// Fill in checklist item with data from the list
					$el.find(".title-section h4").html(item.title);
					$el.find(".title-section .league").addClass(item.league);
					$el.find(".iv-label .level").html("Level " + item.ivs[0]);
					$el.find(".iv-label .ivs").html(item.ivs[1] + "/" + item.ivs[2] + "/" + item.ivs[3]);
					$el.find(".iv-bar .bar").eq(0).width( ((item.ivs[1] / 15) * 100) + "%");
					$el.find(".iv-bar .bar").eq(1).width( ((item.ivs[2] / 15) * 100) + "%");
					$el.find(".iv-bar .bar").eq(2).width( ((item.ivs[3] / 15) * 100) + "%");
					$el.find(".priority-section h4").html(priorities[item.priority-1]);
					$el.attr("priority", item.priority);
					$el.attr("cp", item.cp);

					// Display CP of base evolution
					var baseCP = self.calculateBaseCP(item.baseSpeciesId, item.ivs, 30, item.cp);

					$el.find(".base-form-section .cp-label").html("CP " + baseCP);

					$(".cd-checklist").append($el);
				}
			}

			// Calculate the CP of the Pokemon's base species
			this.calculateBaseCP = function(speciesId, ivs, levelCap, league){
				var battle = new Battle();
				battle.setCP(league);

				var level = Math.min(levelCap, ivs[0]);

				var pokemon = new Pokemon(speciesId, 0, battle);
				pokemon.setLevel(level);
				pokemon.setIV("atk", ivs[1]);
				pokemon.setIV("def", ivs[2]);
				pokemon.setIV("hp", ivs[3]);

				return pokemon.cp;
			}

			// Turn checkboxes on and off

			$("body").on("click", ".check", function(e){
				$(this).toggleClass("on");
			});

		}

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
