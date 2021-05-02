// JavaScript Document

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			this.init = function(){
				$("body").on("click", ".check", checkBox);
				$(".save.button").click(saveSettings);
			};

			// Given a name, save current list to a cookie

			function saveSettings(e){

				var defaultIVs = $("#default-ivs option:selected").val();
				var animateTimeline = $(".check.animate-timeline").hasClass("on") ? 1 : 0;
				var ads = $(".check.ads").hasClass("on") ? 1 : 0;
				var theme = $("#theme-select option:selected").val();
				var matrixDirection = $("#matrix-direction option:selected").val();
				var gamemaster = $("#gm-select option:selected").val();
				var pokeboxId = $("#pokebox-id").val();
				var xls = $(".check.xls").hasClass("on") ? 1 : 0;

				console.log(xls);

				$.ajax({

					url : host+'data/settingsCookie.php',
					type : 'POST',
					data : {
						'defaultIVs' : defaultIVs,
						'animateTimeline' : animateTimeline,
						'theme': theme,
						'matrixDirection': matrixDirection,
						'gamemaster': gamemaster,
						'pokeboxId': pokeboxId,
						'pokeboxLastDateTime': settings.pokeboxLastDateTime,
						'ads': ads,
						'xls': xls
					},
					dataType:'json',
					success : function(data) {
						modalWindow("Settings Saved", $("<p>Your settings have been updated. (Refresh the page if you've updated the site appearance.)</p>"))
					},
					error : function(request,error)
					{
						console.log("Request: "+JSON.stringify(request));
						console.log(error);
					}
				});
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");
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
