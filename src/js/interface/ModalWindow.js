// JavaScript Document

let closePrevention = false; // Prevents closing the window during certain interactions

function modalWindow(header, content) {
  const $content = $(content).clone();
  $content.removeClass('hide');

  const $modal = $(
    `
      <div class="modal">
        <div class="modal-container">
          <div class="modal-header"></div>
          <div class="modal-close"></div>
          <div class="modal-content"></div>
        </div>
      </div>
    `
  );

  $modal.find('.modal-header').html(header);
  $modal.find('.modal-content').append($content);

  $('body').append($modal);

  // Prevent the window from closing for a period of time
  // Close the window on clicking the X or clicking outside the window
  $('.modal-close').click(() => {
    closeModalWindow();
  });

  // Decline confirmation
  $('.modal .no').click(() => {
    closeModalWindow();
  });

  $('.modal').click(() => {
    if ($('.modal-container:hover, option:hover').length === 0) {
      closeModalWindow();
    }
  });
}

function setModalClosePrevention(time) {
  closePrevention = true;

  setTimeout(() => {
    closePrevention = false;
  }, time);
}

function closeModalWindow() {
  if (!closePrevention) {
    $('.modal').remove();
  }
}
