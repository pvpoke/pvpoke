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
				items.push({
					title: $(item).find("title")[0].textContent,
					description: $(item).find("description")[0].textContent,
					link: $(item).find("link")[0].textContent,
					pubDate: new Date(Date.parse($(item).find("pubDate")[0].textContent))
				});
			});

			return items;
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
