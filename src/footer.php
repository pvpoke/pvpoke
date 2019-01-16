		</div><!--end #main-->
	</div><!--end #main-wrap-->
	
	<footer>
		<p class="copyright">Version <a href="https://github.com/pvpoke/pvpoke/releases">1.0.0</a> &copy; 2019, released under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a> | <a href="<?php echo $WEB_ROOT;?>privacy/">Privacy Policy</a></p>
		<p>Pokémon and Pokémon GO are copyright of The Pokémon Company, Niantic, Inc., and Nintendo. All trademarked images and names are property of their respective owners, and any such material is used on this site for educational purposes only.</p>
	</footer>
	<img class="background" src="<?php echo $WEB_ROOT; ?>img/bg.jpg" />
	
	<!--Global script-->
	<script>
		$(".hamburger").click(function(e){
			$("header .menu").slideToggle(125);
		});
		
		// If $_GET request exists, output as JSON into Javascript
		
		<?php
		if($_GET){
			echo 'var get = ' . json_encode($_GET) . ';';
		} else{
			echo 'var get = false;';
		}
		?>
		
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
		
		$(".toggle").click(function(e){
			e.preventDefault();
			
			$(this).toggleClass("active");
		});
		
	</script>
</body>
</html>