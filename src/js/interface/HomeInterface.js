/*
* Interface functionality for move list and explorer
*/

const InterfaceMaster = (function () {

	let instance;

	class InterfaceMaster {
		constructor() {
			this.rss = RSS.getInstance();
			this.gm = GameMaster.getInstance();
			this.initUI();
		}

		initUI() {
			$("button.feed-expand").click(function(e){
				$(".feed-container").toggleClass("expanded");
				$(".feed").scrollTop(0);
			});
		}

		displayRSSFeed(xml) {
			const feed = this.rss.feedToObjects(xml);
			
			const $elements = feed.map(item => 
				this.rss.generateItemHTML(item)
			);
			
			$(".feed").append($elements);
		}
	}

	return {
		getInstance: () => {
			instance = instance || new InterfaceMaster();
			return instance;
		}
	}
})();