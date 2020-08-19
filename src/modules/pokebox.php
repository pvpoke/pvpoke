<div class="pokebox">
	<a href="#" class="button open-pokebox">Import from Pokebox</a>

	<div class="pokebox-import hide">
		<?php if($_SETTINGS->pokeboxId): ?>
			<p>Select Pokemon below to import.</p>
			<div class="pokebox-options">
				<a href="#" class="pokebox-refresh">Refresh</a>
				<a href="https://www.pokebattler.com/pokebox" class="pokebox-edit" target="_blank">Edit Pokebox</a>
			</div>
			<input class="poke-search" context="ranking-search" type="text" placeholder="Search Pokemon" />

			<div class="pokebox-list rankings-container">
				Loading Pokebox...
			</div>
			<div class="center">
				<div class="button select hide multi">Select Pokemon</div>
			</div>
		<?php else: ?>
			<p>Go to Pokebattler to create a Pokebox where you can store your Pokemon and Iv's.</p>

		<?php endif; ?>
	</div>
</div>
