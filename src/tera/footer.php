</div><!--end #main-->
</div><!--end #main-wrap-->

<?php require 'modules/ads/nitro-sidebar-left.php'; ?>
<?php require 'modules/ads/nitro-sidebar-left-300.php'; ?>
<?php require 'modules/ads/nitro-sidebar-right.php'; ?>
<?php require 'modules/ads/nitro-sidebar-right-300.php'; ?>
<?php require 'modules/ads/mobile-320.php'; ?>


<footer>
<p>Pokemon stats via <a href="https://victoryroadvgc.com/sv-paldea-dex/" target="_blank">victoryroadvgc.com</a></p>
<p class="copyright">Version <a href="https://github.com/pvpoke/pvpoke/releases"><?php echo $SITE_VERSION; ?></a> &copy; 2023 PvPoke LLC, released under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a> | <a href="<?php echo $WEB_ROOT;?>privacy/">Privacy Policy</a></p>
<p>Pokémon copyright of The Pokémon Company, GameFreak, and Nintendo. All trademarked images and names are property of their respective owners, and any such material is used on this site for educational purposes only. PvPoke LLC has no affiliation with The Pokémon Company, Niantic, Inc., or Nintendo.</p>
</footer>

<!--Global script-->
<script>

// Auto select link

$(".share-link input").click(function(e){
	this.setSelectionRange(0, this.value.length);
});

// Link share copying

$("body").on("click", ".share-link .copy", function(e){
	var el = $(e.target).prev()[0];
	el.focus();
	el.setSelectionRange(0, el.value.length);
	document.execCommand("copy");
});

// Toggleable sections

$("body").on("click", ".toggle", function(e){
	e.preventDefault();

	$(e.target).closest(".toggle").toggleClass("active");
});

// Turn checkboxes on and off

$("body").on("click", ".check", function checkBox(e){
	$(this).toggleClass("on");
	$(this).trigger("change");
});


</script>
</body>
</html>
