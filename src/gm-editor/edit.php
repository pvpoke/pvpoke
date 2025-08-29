<?php

$META_TITLE = 'Gamemaster Editor';

$META_DESCRIPTION = 'Customize Pokemon or add new Pokemon for your simulations.';

$BODY = '';

$PLACEHOLDER = '';

$EXPORT_TITLE = '';

$NEW_BUTTON_TEXT = '';

$category = '';

if(isset($_GET['c'])){
    if($_GET['c'] == 'pokemon'){
        $META_TITLE = 'All Pokemon | Gamemaster Editor';
        $META_DESCRIPTION = 'Customize Pokemon or add new Pokemon for your simulations.';
        $BODY = 'Customize Pokemon or add new Pokemon for your simulations.';
        $PLACEHOLDER = 'Search Pokemon';
        $EXPORT_TITLE = 'Import/Export All Pokemon';
        $NEW_BUTTON_TEXT = '+ New Pokemon';
        $category = 'pokemon';
    } else if($_GET['c'] == 'moves'){
        $META_TITLE = 'All Moves | Gamemaster Editor';
        $META_DESCRIPTION = 'Customize moves or add new moves for your simulations.';
        $BODY = 'Customize moves or add new moves for your simulations.';
        $PLACEHOLDER = 'Search Moves';
        $EXPORT_TITLE = 'Import/Export All Moves';
        $NEW_BUTTON_TEXT = '+ New Move';
        $category = 'moves';
    }
}

require_once '../header.php';

if(isset($_GET['c'])){
    if($_GET['c'] == 'pokemon'){
        $NEW_BUTTON_LINK = $WEB_ROOT . 'gm-editor/pokemon/new/';
    } else if($_GET['c'] == 'moves'){
        $NEW_BUTTON_LINK = $WEB_ROOT . 'gm-editor/moves/new/';
    }
}
?>

<h1>Gamemaster Editor [Beta]</h1>

<div class="section white" id="gm-editor-pokemon">
    <div class="flex space-between align-items-start">
        <a class="gm-title" href="<?php echo $WEB_ROOT; ?>gm-editor"></a>
        <div class="ranking-categories mode-select">
            <a <?php if($category == 'pokemon'): ?>class="selected"<?php endif; ?> href="<?php echo $WEB_ROOT; ?>gm-editor/pokemon/">Pokemon</a>
            <a <?php if($category == 'moves'): ?>class="selected"<?php endif; ?> href="<?php echo $WEB_ROOT; ?>gm-editor/moves/">Moves</a>
        </div>
    </div>

    <?php if(isset($_GET['c'])) : ?>
        <!--All Pokemon table-->
        <p class="mt-1"><?php echo $BODY; ?></p>

        <div class="poke-search-container">
            <input class="poke-search" target="train-table" type="text" placeholder="<?php echo $PLACEHOLDER; ?>" />
            <a href="#" class="search-info">i</a>

            <!--<div class="form-group" data="search-mode">
                <div class="option on" value="filter">Filter</div>
                <div class="option" value="find">Find</div>
            </div>-->

            <a class="link-btn" href="<?php echo $NEW_BUTTON_LINK; ?>"><?php echo $NEW_BUTTON_TEXT; ?></a>
        </div>
        
        <div class="table-container">
            <table class="train-table" cellspacing="0">

                <?php if($_GET['c'] == 'pokemon') : ?>
                    <thead>
                        <tr>
                            <th><a class="selected" href="#" data="dex">Dex</a></th>
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
                                <a class="poke-edit" href="#">Edit</a>
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
                <?php elseif($_GET['c'] == 'moves'): ?>
                    <thead>
                        <tr>
                            <th><a class="selected" href="#" data="name">Move</a></th>
                            <th style="min-width: 100px;"></th>
                            <th><a href="#" data="type">Type</a></th>
                            <th><a href="#" data="power">Power</a></th>
                            <th><a href="#" data="energy">Energy</a></th>
                            <th><a href="#" data="turns">Turns</a></th>
                            <th>Effect</th>
                        </tr>
                        <!--Row html to clone-->
                        <tr class="hide">
                            <td data="name"></td>
                            <td class="controls">
                                <a class="poke-edit" href="#" target="_blank">Edit</a>
                                <a class="poke-copy" href="#">Copy</a>
                                <a class="poke-delete" href="#">Delete</a>
                            </td>
                            <td data="type"></td>
                            <td data="power"></td>
                            <td data="energy"></td>
                            <td data="turns"></td>
                            <td data="effect"></td>
                        </tr>
                    </thead>
                <?php endif; ?>
                <tbody>
                </tbody>
            </table>
        </div>

        <div class="flex">
            <div id="save-changes-btn" class="button" style="margin-top:25px;" disabled>Save Changes</div>
        </div>
    <?php endif; ?>
</div>

<div class="section white custom-rankings-import">
	<h3><?php echo $EXPORT_TITLE; ?></h3>

	<p>Copy the text below to export all entries from your custom gamemaster or paste to overwrite them. Only copy and paste code from a trusted source.</p>

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

<div class="import-error hide">
	<p>There was an error importing the custom data. Ensure that the data is not malformed and contains valid Pokemon or move data.</p>
</div>

<div class="save-data hide">
	<p>Data saved successfully.</p>
</div>

<div class="save-data-error hide">
	<p>There was an error saving the data. Ensure that all entries are valid.</p>
</div>

<div class="refresh-prompt hide">
	<p>Data was changed in a different window. <a href="#"><b>Refresh the page</b></a> to prevent your data from being overwritten.</p>
</div>

<?php
if($category == 'pokemon'){
    require_once '../modules/search-string-help.php';
} else if($category == 'moves'){
    require_once '../modules/search-string-help-moves.php';
}

?>


<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorUtils.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorTableInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
