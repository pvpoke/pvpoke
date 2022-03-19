<div class="article-item template hide flex">
	<div class="col-3">
		<a href="#">
			<img src="" />
		</a>
	</div>
	<div class="col-9">
		<h4><a href="#"></a></h4>
		<div class="date"></div>
		<p></p>
		<div class="tags"></div>
	</div>
</div>

<script>
// Returns a JQuery element of an article item will filled in content
function makeArticleItem(a){
	// Clone the article preview template and fill in content
	var $article = $(".article-item.template").clone().removeClass("hide template");

	var thumbPath = webRoot+"articles/article-assets/"+a.id+"/thumb.jpg";

	if(a.tags.indexOf("Community Day") > -1){
		thumbPath = webRoot+"articles/article-assets/community-day/"+a.id+"/thumb.jpg";
	}

	if(a.path == "infographics"){
		thumbPath = webRoot+"articles/article-assets/infographics/"+a.id+"/thumb.jpg";
	}

	$article.find("h4 a").html(a.title);
	$article.find(".date").html(a.date);
	$article.find("p").html(a.description);
	$article.find("img").attr("src", thumbPath);
	$article.find("a").attr("href", webRoot+"articles/"+a.path+"/"+a.id+"/");

	for(var i = 0; i < a.tags.length; i++){
		var $tag = $("<a href=\""+webRoot+"articles?tag="+a.tags[i]+"\"># "+a.tags[i]+"</a>");
		$article.find(".tags").append($tag);
	}

	return $article;
}
</script>
