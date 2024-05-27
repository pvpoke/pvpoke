/*
* Interface functionality for move list and explorer
*/

var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			var self = this;
			var gm = GameMaster.getInstance();
			var rss = RSS.getInstance();
			var feed;

			this.init = function(){
			};

			this.displayRSSFeed = function(xml){
				feed = rss.feedToObjects(xml);

				for(var i = 0; i < feed.length; i++){
					var $html = rss.generateItemHTML(feed[i]);
					$(".feed").append($html);
				}
			}

			$("button.feed-expand").click(function(e){
				$(".feed-container").toggleClass("expanded");
				$(".feed").scrollTop(0);
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
