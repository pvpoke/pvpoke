<?php

$META_TITLE = 'RSS Feed';

require_once '../header.php';

?>

<h1>RSS Feed</h1>
<div class="section league-select-container white">
	<p>Add a post to the site's RSS feed and copy the output to rss/feed.xml.</p>

	<input type="text" id="post-title" placeholder="Post title" />
	<textarea id="post-content" style="margin-top: 10px; width: 100%; height: 200px; font-family: sans-serif; font-size: 16px;" ></textarea>
	<button id="upload">Upload image</button><label id="image-name"></label>

	<div id="add-post" class="button" style="max-width: 200px; margin: 20px 0 0 0;">Add Post</div>

	<hr></hr>
	<br>


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

			$("textarea.export").val((new XMLSerializer()).serializeToString(xml));
		}
	});


	$("#add-post").click(function(e){

		var pubDate = new Date().toUTCString();

		$(xml).find("channel").append("<item><title>"+$("#post-title").val()+"</title><description>"+$("#post-content").val()+"</description><pubDate>"+pubDate+"</pubDate></item>");

		$("textarea.export").val((new XMLSerializer()).serializeToString(xml));
	});

});


</script>

<?php require_once '../footer.php'; ?>
