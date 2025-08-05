<?php

$META_TITLE = 'Pokemon | Gamemaster Editor';

$META_DESCRIPTION = 'Customize Pokemon or add new Pokemon for your simulations.';


require_once '../header.php';
?>

<h1>Gamemaster Editor</h1>

<div class="section white" id="gm-editor-pokemon">
    <div class="flex space-between align-items-start">
        <a class="gm-title" href="<?php echo $WEB_ROOT; ?>gm-editor"></a>
        <div class="ranking-categories mode-select">
            <a class="selected" href="<?php echo $WEB_ROOT; ?>gm-editor/pokemon/">Pokemon</a>
            <a href="<?php echo $WEB_ROOT; ?>gm-editor/moves/">Moves</a>
        </div>
    </div>

    <?php if(! isset($_GET['p'])) : ?>
        <!--All Pokemon table-->
        <p class="mt-1">Customize Pokemon or add new Pokemon for your simulations.</p>

        <div class="poke-search-container">
            <input class="poke-search" target="train-table" type="text" placeholder="Search Pokemon" />
            <a href="#" class="search-info">i</a>
        </div>

        <div class="table-container">
            <table class="train-table" cellspacing="0">
                <thead>
                    <tr>
                        <th><a href="#" data="dex">Dex</a></th>
                        <th><a href="#" data="name">Pokemon</a></th>
                        <th style="min-width: 100px;"></th>
                        <th>Fast Moves</th>
                        <th>Charged Moves</th>
                        <th>Tags</th>
                        <th><a href="#" data="priority">Search<br>Priority</a></th>
                        <th><a href="#" data="released">Released</a></th>
                    </tr>
                    <!--Row html to clone-->
                    <tr class="hide">
                        <td data="dex"></td>
                        <td data="name"></td>
                        <td class="controls">
                            <a class="poke-edit" href="#" target="_blank">Edit</a>
                            <a class="poke-copy" href="#">Copy</a>
                            <a class="poke-delete" href="#">Delete</a>
                        </td>
                        <td data="fast"></td>
                        <td data="charged"></td>
                        <td data="tags"></td>
                        <td data="priority"></td>
                        <td data="released"></td>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    <?php else: ?>
        <!--Edit individual Pokemon-->
        <p class="mt-1">Customize Pokemon or add new Pokemon for your simulations.</p>
    <?php endif; ?>
</div>

<div class="section white custom-rankings-import">
	<h3>Import/Export All Pokemon</h3>

	<p>Copy the text below to export all Pokemon data from your custom gamemaster or paste to overwrite it. Only copy and paste code from a trusted source.</p>

	<textarea class="import"></textarea>
	<div class="copy">Copy</div>
</div>

<div class="delete-poke-confirm hide">
	<p>Delete the entry for <b><span class="name"></span></b>? It will no longer be available for simulations with this custom gamemaster.</p>

	<div class="center flex">
		<div class="button yes">Yes</div>
		<div class="button no">No</div>
	</div>
</div>


<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorPokeInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
