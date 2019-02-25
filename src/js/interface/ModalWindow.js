// JavaScript Document

function modalWindow(header, content){
	
	var $content = $(content).clone();
	$content.removeClass("hide");
	
	var $modal = $("<div class=\"modal\"><div class=\"modal-container\"><div class=\"modal-header\"></div><div class=\"modal-close\"></div><div class=\"modal-content\"></div></div></div>");
	
	
	$modal.find(".modal-header").html(header);
	$modal.find(".modal-content").append($content);
	
	$("body").append($modal);

}

// Close the window on clicking the X or clicking outside the window

$("body").on("click", ".modal-close", function(e){
	$(".modal").remove();
});


$("body").on("click", ".modal", function(e){
	
	if($(".modal-container:hover").length == 0){
		$(".modal").remove();
	}
});