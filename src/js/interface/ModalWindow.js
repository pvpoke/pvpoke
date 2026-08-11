// JavaScript Document

var closePrevention = false; // Prevents closing the window during certain interactions

function modalWindow(header, content){

	var $content = $(content).clone();
	$content.removeClass("hide");

	var $modal = $("<div class=\"modal\"><div class=\"modal-container\"><div class=\"modal-header\"></div><div class=\"modal-close\"></div><div class=\"modal-content\"></div></div></div>");


	$modal.find(".modal-header").html(header);
	$modal.find(".modal-content").append($content);

	$("body").append($modal);

	// Close the window on clicking the X or clicking outside the window

	$(".modal-close").click(function(e){
		closeModalWindow();
	});

	// Decline confirmation

	$(".modal .no").click(function(e){
		closeModalWindow();
	});


	$(".modal").click(function(e){

		if($(".modal-container:hover, option:hover, input:focus").length == 0){
			closeModalWindow();
		}
	});

	// Prevent modal from closing when selecting a dropdown option that extends outside the modal window
	$(".modal select").click(function(e){
		setModalClosePrevention(250);
	});
}

function setModalClosePrevention(time){
	closePrevention = true;

	setTimeout(function(){
		closePrevention = false;
	}, time);
}

function closeModalWindow(){
	if(! closePrevention){
		$(".modal").last().remove();
	}
}
