// JavaScript Document

const InterfaceMaster = (function () {
  let instance;

  function createInstance() {
    const object = new InterfaceObject();

    function InterfaceObject() {
      this.init = function () {
        $('body').on('click', '.check', checkBox);
        $('.save.button').click(saveSettings);
      };

      // Given a name, save current list to a cookie
      function saveSettings() {
        const defaultIVs = $('#default-ivs option:selected').val();
        const animateTimeline = $('.check.animate-timeline').hasClass('on') ? 1 : 0;
        const theme = $('#theme-select option:selected').val();
        const matrixDirection = $('#matrix-direction option:selected').val();
        const gamemaster = $('#gm-select option:selected').val();

        $.ajax({
          url: `${host}data/settingsCookie.php`,
          type: 'POST',
          data: {
            defaultIVs,
            animateTimeline,
            theme,
            matrixDirection,
            gamemaster,
          },
          dataType: 'json',
          success() {
            modalWindow(
              'Settings Saved',
              $(
                "<p>Your settings have been updated. (Refresh the page if you've updated the site appearance.)</p>"
              )
            );
          },
          error(request, error) {
            console.log(`Request: ${JSON.stringify(request)}`);
            console.log(error);
          },
        });
      }

      // Turn checkboxes on and off
      function checkBox() {
        $(this).toggleClass('on');
      }
    }

    return object;
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();
