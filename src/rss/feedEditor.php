<?php

$META_TITLE = 'RSS Feed';

require_once '../header.php';

?>

<h1>RSS Feed</h1>
<div class="section league-select-container white">
	<p>Add a post to the site's RSS feed and copy the output to rss/feed.xml.</p>

	<input type="text" id="post-title" placeholder="Post title" style="margin-bottom: 10px; font-weight: bold;" />
	<input type="text" id="post-link" placeholder="URL" value="https://pvpoke.com/" />
	<textarea id="post-content" style="margin-top: 10px; width: 100%; height: 200px; font-family: sans-serif; font-size: 16px;" ></textarea>
	<input type="file" id="upload" accept="image/png, image/jpeg" />

	<div id="add-post" class="button" style="max-width: 200px; margin: 20px 0 0 0;">Add Post</div>

	<hr></hr>
	<br>

	<div class="feed">
	</div>

</div>

<textarea class="export" style="width:100%; height: 150px; padding: 10px;"></textarea>
<div class="button copy export-json">Copy</div>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>

<script>

$(function() {

	var xml;

	$.ajax({
		type: "GET" ,
		url: "feed.xml?v="+siteVersion,
		dataType: "xml" ,
		success: function(data) {
			xml = data;

			updateXMLDisplay();
		}
	});


	$("#add-post").click(function(e){

		var pubDate = new Date().toUTCString();

		$(xml).find("channel").append("<item><title>"+$("#post-title").val()+"</title><description>"+$("#post-content").val()+"</description><link>"+$("#post-link").val()+"</link><pubDate>"+pubDate+"</pubDate></item>");

		updateXMLDisplay();
	});

	function updateXMLDisplay(){
		$("textarea.export").val((new XMLSerializer()).serializeToString(xml));

		// Display RSS feed
		var items = [];

		$(xml).find("channel item").each(function(index, item){
			items.push({
				title: $(item).find("title")[0].textContent,
				description: $(item).find("description")[0].textContent,
				link: $(item).find("link")[0].textContent,
				pubDate: new Date(Date.parse($(item).find("pubDate")[0].textContent))
			});
		});

		console.log(items);
	}

});


</script>

<?php require_once '../footer.php'; ?>
