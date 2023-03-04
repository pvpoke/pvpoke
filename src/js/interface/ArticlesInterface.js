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

				gm.loadArticleData(self.receiveArticleData);

				window.addEventListener('popstate', function(e) {
					get = e.state;
					self.loadGetData();
				});
			};

			// Callback for loading article data
			this.receiveArticleData = function(d){
				data = d;

				// Display all articles or search if url parameter exists
				if(! get){
					self.displayArticles(data);
				} else{
					$("input.article-search").val(get.tag);
					$("input.article-search").trigger("change");
				}

			}

			// Display articles after article metadata is loaded

			this.displayArticles = function(d){
				$(".section .articles").html("");

				for(var i = 0; i < d.length; i++){
					var $article = makeArticleItem(d[i]);

					$(".section .articles").append($article);
				}
			}

			// Search for an article or tag

			$("input.article-search").on("keyup change", function(e){
				var searchStr = $(this).val().toLowerCase().trim();

				// Remove hashtag from searches if present
				searchStr = searchStr.replace(/\#/g, "");

				// Iterate through all articles and produce a subset of matching articles
				var matches = [];

				for(var i = 0; i < data.length; i++){
					var article = data[i];
					var match = false;

					if(article.title.toLowerCase().indexOf(searchStr) > -1){
						match = true;
					}

					for(var n = 0; n < article.tags.length; n++){
						if(article.tags[n].toLowerCase().indexOf(searchStr) > -1){
							match = true;
						}
					}

					if(match){
						matches.push(article);
					}
				}

				if(searchStr != ""){
					self.displayArticles(matches);
				} else{
					self.displayArticles(data);
				}
			});

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
