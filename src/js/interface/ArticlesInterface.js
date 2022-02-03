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

			this.init = function(){
				if(! get){

				}

				gm.loadArticleData(self.displayArticles);

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});
			};

			// Display articles after article metadata is loaded

			this.displayArticles = function(data){
				$(".section .articles").html("");

				for(var i = 0; i < data.length; i++){
					var $article = makeArticleItem(data[i]);

					$(".section .articles").append($article);
				}
			}

			// Turn checkboxes on and off

			function checkBox(e){
				$(this).toggleClass("on");

				if($(this).hasClass("stab")){
					self.generateExploreResults(false);
				}
			}

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
