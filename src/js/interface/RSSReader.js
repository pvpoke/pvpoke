// JavaScript Document

var RSS = (function () {
    var instance;

    function createInstance(callback) {
        var object = new Object();

		object.xml = {};

		$.ajax({
			type: "GET" ,
			url: webRoot+"/rss/feed.xml?v="+siteVersion,
			dataType: "xml" ,
			success: function(data) {
				xml = data;

				if(typeof callback === 'function'){
					callback(xml);
				}
			}
		});


		// Return the provided XML data as an array of objects
		object.feedToObjects = function(xml){
			xml = typeof xml !== 'undefined' ? xml : object.xml;

			var items = [];

			$(xml).find("channel item").each(function(index, item){
				// Limit feed to first 15
				if(index < 15){
					items.push({
						title: $(item).find("title")[0].textContent,
						description: $(item).find("description")[0].textContent,
						link: $(item).find("link")[0].textContent,
						pubDate: new Date(Date.parse($(item).find("pubDate")[0].textContent))
					});
				}
			});

			return items;
		}

		// Return a JSON object of HTML generated for a provided news object
		object.generateItemHTML = function(item){
			var $html = $(".news-item.template").first().clone().removeClass("hide template");

			$html.find("h4").html(item.title);
			$html.find(".news-content").html(item.description);
			$html.find(".news-date").html(item.pubDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));

			if(item.link == "https://pvpoke.com/"){
				$html.find(".news-info a").remove();
			} else{
				var linkText = item.link.replace("https://", "");

				$html.find(".news-info a .link-text").html(linkText);
				$html.find(".news-info a").attr("href", item.link);

				if(item.link.indexOf("pvpoke.com") == -1){
				   $html.find(".news-info a").attr("target", "_blank");
			   }
			}

			return $html;
		}

        return object;
    }

    return {
        getInstance: function (interface) {
            if (!instance) {
                instance = createInstance(interface);
            }
            return instance;
        }
    };
})();
