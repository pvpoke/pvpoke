/*
 * Funtionality for the Pokemon selection interface, for Pokemon groups.
 * This file is dependent on a few others: PokeSelect.js and ModalWindow.js
 */

function Pokebox(element, selector, selectMode){
	var $el = element;
	var selector = selector;
	var selectMode = selectMode;
	var self = this;

	$el.find("a.open-pokebox").click(openPokebox);

	function openPokebox(e){
		e.preventDefault();

		modalWindow("Import Pokemon", $el.find(".pokebox-import"));
	}
}
