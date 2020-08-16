// JavaScript Document

const InterfaceMaster = (function () {
  let instance;

  function createInstance() {
    const object = new InterfaceObject();

    function InterfaceObject() {
      let battle;
      const ranker = RankerMaster.getInstance();
      const pokeSelectors = [];
      const animating = false;
      const self = this;

      this.init = function () {
        const data = GameMaster.getInstance().data;

        $('.league-select').on('change', selectLeague);
        $('.cup-select').on('change', selectCup);
        $('.format-select').on('change', selectFormat);
        $('.simulate').on('click', startRanker);

        battle = new Battle();
      };

      // Event handler for changing the league select
      function selectLeague() {
        const allowed = [1500, 2500, 10000];
        const cp = parseInt($('.league-select option:selected').val());

        if (allowed.indexOf(cp) > -1) {
          battle.setCP(cp);
        }
      }

      // Event handler for changing the cup select
      function selectCup() {
        const cup = $('.cup-select option:selected').val();
        battle.setCup(cup);
      }

      // Event handler for changing the format category
      function selectFormat() {
        const format = $('.format-select option:selected').val();
        const cup = $('.format-select option:selected').attr('cup');

        $('.cup-select option').hide();
        $(`.cup-select option[cat="${format}"]`).show();
        $(`.cup-select option[cat="${format}"]`).eq(0).prop('selected', 'selected');

        if (cup) {
          $(`.cup-select option[value="${cup}"]`).eq(0).prop('selected', 'selected');
        }

        $('.cup-select').trigger('change');

        if (format === 'all' || cup) {
          $('.cup-select').hide();
        } else {
          $('.cup-select').show();
        }

        if (format === 'custom') {
          // Redirect to the custom rankings page
          window.location.href = `${webRoot}custom-rankings/`;
        }
      }

      // Run simulation
      function startRanker() {
        ranker.rankLoop(battle.getCP(), battle.getCup());
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
