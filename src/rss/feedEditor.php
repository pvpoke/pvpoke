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
<script src="<?php echo $WEB_ROOT; ?>js/interface/RSSReader.js?v=<?php echo $SITE_VERSION; ?>"></script>

<script>

$(function() {

	var xml;

	function getXMLData(data){
		xml = data;
		updateXMLDisplay();
	}

	var rss = RSS.getInstance(getXMLData)


	$("#add-post").click(function(e){

		var pubDate = new Date().toUTCString();

		$(xml).find("channel").append("<item><title>"+$("#post-title").val()+"</title><description>"+$("#post-content").val()+"</description><link>"+$("#post-link").val()+"</link><pubDate>"+pubDate+"</pubDate></item>");

		updateXMLDisplay();
	});

	function updateXMLDisplay(){
		$("textarea.export").val((new XMLSerializer()).serializeToString(xml));

		var items = rss.feedToObjects(xml);

		console.log(items);
	}

});


</script>

<?php require_once '../footer.php'; ?>
