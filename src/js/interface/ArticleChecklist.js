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
			var defaultData;
			var gm = GameMaster.getInstance();
			var checklist = [];
			var priorities = ["Priority", "Nice to Have", "Extra Mile"];
			var selectedIndex = -1;
			var selectedSort = "priority";

			var storageKey = "cd-" + articleId;

			this.init = function(){
				// Load checklist from JSON
				var file = webRoot+"articles/community-day/data/"+articleId+".json?v="+siteVersion;

				$.getJSON( file, function( d ){
					console.log("article checklist loaded");

					data = d;
					defaultData = d;
					checklist = d.checklist;

					// Check for a locally stored checklist
					if(window.localStorage.getItem(storageKey) !== null){
						data = JSON.parse(window.localStorage.getItem(storageKey));
						checklist = data.checklist;
						self.displayChecklist(checklist);
					} else{
						self.displayChecklist(checklist);
					}
				});
			};

			// Given a checklist, display it in the article
			this.displayChecklist = function(list, sort){
				sort = typeof sort !== 'undefined' ? sort : selectedSort;

				// Give list items a caught value of 0 if undefined

				for(var i = 0; i < list.length; i++){
					if(! list[i].caught){
						list[i].caught = 0;
					}
				}

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
					$el.attr("index", i);

					// Display CP of base evolution
					var baseCP = self.calculateBaseCP(item.baseSpeciesId, item.ivs, 30, item.cp);

					$el.find(".base-form-section .cp-item").eq(0).find(".cp").html("CP "+baseCP);
					$el.find(".base-form-section img").attr("src", "../../article-assets/community-day/base/"+item.speciesId+".png");

					// Show if caught already
					if(item.caught){
						$el.find(".check").addClass("on");
						$el.addClass("caught");
					}

					// Show notes tooltip if notes exist

					if((item.notes)&&(item.notes != "")){
						$el.find("a.info").show();
					} else{
						$el.find("a.info").hide();
					}


					$(".cd-checklist").append($el);
				}

				// Add new item button

				var $newItem = $("<div class=\"checklist-item new-item edit-control-on\"><span>+ New</span></div>");
				$(".cd-checklist").append($newItem);
			}

			// Store the current checklist in local storage
			this.saveChecklist = function(){
				var json = JSON.stringify(data);

				window.localStorage.setItem(storageKey, json);
				console.log("checklist saved");
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

			// Display notes in popup

			$("body").on("click", ".checklist-item a.info", function(e){
				e.preventDefault();

				var $el = $(this).closest(".checklist-item");
				var itemIndex = $(".cd-checklist .checklist-item").index($el);
				var notes = checklist[itemIndex].notes;

				// Replace all line breaks with HTML <br>
				notes = notes.replace(/(?:\r\n|\r|\n)/g, '<br>');

				// Apply bold formatting to Attack, Defense, and HP values in the description.

				notes = notes.replace(/(^|\s)([0-9.]*\sAttack)(|$)/ig, '$1<b>$2</b>$3');
				notes = notes.replace(/(^|\s)([0-9.]*\sDefense)(|$)/ig, '$1<b>$2</b>$3');
				notes = notes.replace(/(^|\s)([0-9.]*\sHP)(|$)/ig, '$1<b>$2</b>$3');

				var $desc = $("<div>"+notes+"</div>");


				modalWindow(checklist[itemIndex].title, $desc);
			});

			// Open the new item or edit item window

			this.openItemEditor = function(item){
				modalWindow("New Item", $(".checklist-new-item"));

				// Populate species dropdown

				for(var i = 0; i < data.species.length; i++){
					var battle = new Battle();
					var pokemon = new Pokemon(data.species[i].speciesId, 0, battle);

					var $option = $("<option>"+pokemon.speciesName+"</option>");
					$option.attr("value", data.species[i].speciesId);
					$option.attr("baseSpeciesId", data.species[i].baseSpeciesId);

					if((data.species[i].default)&&(typeof item == 'undefined')){
						$option.attr("selected", "selected");
					}

					$(".modal .checklist-new-item select.speciesId").append($option);
				}

				// If a selected item is set, fill in values
				if(typeof item !== 'undefined'){
					$(".modal input.title").val(item.title);

					$(".modal select.speciesId option[value=\""+item.speciesId+"\"]").prop("selected", "selected");
					$(".modal select.league option[value=\""+item.league+"\"]").prop("selected", "selected");
					$(".modal select.priority option[value=\""+item.priority+"\"]").prop("selected", "selected");

					$(".modal input.iv").eq(0).val(item.ivs[1]);
					$(".modal input.iv").eq(1).val(item.ivs[2]);
					$(".modal input.iv").eq(2).val(item.ivs[3]);

					$(".modal textarea.notes").val(item.notes);

					$(".modal .checklist-new-item .button.add").hide();
				} else{
					$(".modal .checklist-new-item .button.save").hide();
				}
			}

			// Add a new item from the form inputs

			this.saveItem = function(index){
				if(! self.validateItemForm()){
					return false;
				}

				var speciesId = $(".modal select.speciesId option:selected").val();
				var cp = parseInt($(".modal select.league option:selected").attr("cp"));
				var ivs = [];

				ivs.push(parseInt($(".modal input.iv").eq(0).val()));
				ivs.push(parseInt($(".modal input.iv").eq(1).val()));
				ivs.push(parseInt($(".modal input.iv").eq(2).val()));

				var battle = new Battle();
				battle.setCP(cp);

				var pokemon = new Pokemon(speciesId, 0, battle);
				pokemon.autoLevel = true;
				pokemon.setIV("atk", ivs[0]);
				pokemon.setIV("def", ivs[1]);
				pokemon.setIV("hp", ivs[2]);

				ivs.unshift(pokemon.level);

				var item = {
					title: $(".modal input.title").val(),
					speciesId: speciesId,
					baseSpeciesId: $(".modal select.speciesId option:selected").attr("baseSpeciesId"),
					league: $(".modal select.league option:selected").val(),
					cp: cp,
					ivs: ivs,
					priority: parseInt($(".modal select.priority option:selected").val())
				};

				var notes = $(".modal textarea.notes").val();

				if(notes != ""){
					item.notes = notes;
				}


				if(typeof index == 'undefined'){
					// Save new item
					checklist.push(item);
				} else{
					// Preserve caught attribute
					if(checklist[index].caught){
						item.caught = checklist[index].caught;
					};

					checklist[index] = item;
				}

				closeModalWindow();
				self.saveChecklist();
				self.displayChecklist(checklist);
			}

			// Validate form fields for new or updated item

			this.validateItemForm = function(){
				var valid = true;
				var inputs = [
					".modal input.title",
					".modal input.iv[iv=\"atk\"]",
					".modal input.iv[iv=\"def\"]",
					".modal input.iv[iv=\"hp\"]"
				];

				for(var i = 0; i < inputs.length; i++){
					$(inputs[i]).removeClass("invalid");

					if($(inputs[i]).val() == ""){
						$(inputs[i]).addClass("invalid");
						valid = false;
					}
				}

				// Check that IV's are within valid range
				$(".modal input.iv").each(function(index, value){
					var value = $(this).val();

					if(value % 1 != 0){
						$(this).addClass("invalid");
						valid = false;
					}

					if(value < 0 || value > 15){
						$(this).addClass("invalid");
						valid = false;
					}
				});

				return valid;
			}

			// Turn checkboxes on and off

			$("body").on("click", ".check", function(e){
				$(this).toggleClass("on");

				var $el = $(this).closest(".checklist-item");
				$el.toggleClass("caught");

				var itemIndex = $(".cd-checklist .checklist-item").index($el);

				if($(this).hasClass("on")){
					checklist[itemIndex].caught = 1;
				} else{
					checklist[itemIndex].caught = 0;
				}

				self.saveChecklist();
			});

			// Turn on edit controls

			$(".control-container button.edit").on("click", function(e){
				$("#main").attr("edit", "on");
			});

			// Trigger checkbox click on title click

			$("body").on("click", ".title-section h4", function(e){
				var $el = $(this).closest(".checklist-item");
				$el.find(".check").trigger("click");
			});

			// Change the checklist sorting

			$(".checklist-controls .sort").on("change", function(e){
				var sort = $(this).find("option:selected").val();
				var direction = $(this).find("option:selected").attr("direction");

				selectedSort = sort;

				self.displayChecklist(checklist, sort);
			});

			// Confirm to reset the checklist

			$(".checklist-controls button.reset").on("click", function(e){
				modalWindow("Reset Checklist", $(".checklist-reset-confirm"));

				// Confirm reset

				$(".modal .checklist-reset-confirm .yes").click(function(e){
					data = defaultData;
					checklist = defaultData.checklist;
					self.saveChecklist();

					self.displayChecklist(checklist);

					closeModalWindow();
				});
			});

			// Confirm to delete an item

			$("body").on("click", ".checklist-item a.delete", function(e){
				e.preventDefault();

				selectedIndex = $(this).closest(".checklist-item").attr("index");

				var item = checklist[selectedIndex];

				modalWindow("Delete Item", $(".checklist-delete-confirm"));

				$(".modal .checklist-delete-confirm .item-name").html(item.title);

				// Confirm reset

				$(".modal .checklist-delete-confirm .yes").click(function(e){
					checklist.splice(selectedIndex, 1);
					self.saveChecklist();
					self.displayChecklist(checklist);

					closeModalWindow();
				});
			});

			// Open new item form

			$("body").on("click", ".checklist-item.new-item", function(e){
				self.openItemEditor();
			});

			// Open edit item form

			$("body").on("click", ".checklist-item a.edit", function(e){
				e.preventDefault();

				selectedIndex = $(this).closest(".checklist-item").attr("index");

				var item = checklist[selectedIndex];

				self.openItemEditor(item);
			});

			// Add a new item

			$("body").on("click", ".modal .checklist-new-item .button.add", function(e){
				self.saveItem();
			});

			// Save a selected item

			$("body").on("click", ".modal .checklist-new-item .button.save", function(e){
				self.saveItem(selectedIndex);
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
