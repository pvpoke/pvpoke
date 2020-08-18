// Search input handler

$(function () {
  let searchTimeout;
  let searchStr = '';

  $(".poke-search[context='ranking-search']").on('keyup', () => {
    searchStr = $(this).val().toLowerCase();

    // Reset the timeout when a new key is typed. This prevents queries from being submitted too quickly and bogging things down on mobile.
    window.clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(submitSearchQuery, 200);
  });

  $('a.search-info').click((e) => {
    e.preventDefault();
    modalWindow('Search Strings', $('.sandbox-search-strings'));
  });

  function submitSearchQuery() {
    const list = GameMaster.getInstance().generatePokemonListFromSearchString(searchStr);

    $('.rankings-container > .rank').each(() => {
      const id = $(this).attr('data');

      if (list.indexOf(id) > -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }
});
