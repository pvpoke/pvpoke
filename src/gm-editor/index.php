<?php

$META_TITLE = 'Gamemaster Editor';

$META_DESCRIPTION = 'Customize Pokemon or Moves for your simulations.';


require_once '../header.php';
?>

<h1>Gamemaster Editor</h1>

<div  id="gm-editor" class="section white custom-rankings-import">

    <div class="gm-editor-block">
        <h3>Select a Gamemaster</h3>

        <div class="flex gap-15 align-items-center" style="margin-bottom: 15px;">
            <select id="gm-select" class="gm-select large">
                <option value="gamemaster">Default</option>
            </select>
            <div id="delete-gamemaster">X</div>
        </div>

        <div class="flex gap-15">
            <a id="save-new-btn" href="<?php echo $WEB_ROOT; ?>gm-editor/pokemon/" class="button">Save New</a>
            <a id="save-btn" href="#" class="button" style="display: none" disabled>Save Changes</a>
            <a id="edit-btn" href="<?php echo $WEB_ROOT; ?>gm-editor/pokemon/" class="button" style="display: none">Edit</a>
        </div>
    </div>

</div>

<div class="section white custom-rankings-import">
	<h3>Import/Export Gamemaster</h3>

	<p>Copy the text below to export your custom gamemaster or paste to overwrite it. Only copy and paste code from a trusted source.</p>

	<textarea class="import"></textarea>
	<div class="copy">Copy</div>
</div>


<div id="gm-changelog" class="section white custom-rankings-import">
	<a class="toggle" href="#">Changelog <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">

        <div class="table-container">
            <table class="train-table" cellspacing="0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Changes</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>

    </div>
</div>

<div class="section white">
	<a class="toggle" href="#">About Gamemaster Editor <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
        <p>This feature is for advanced users. Editing these values may alter or break the site simulations. If you encounter technical difficulties, you can revert to the default gamemaster from here or the <a href="<?php echo $WEB_ROOT; ?>settings/">Settings page</a>.</p>
        <p>"Gamemaster" refers to the dataset which governs all game parameters, such as Pokemon and move information. These pages allow you to directly edit the gamemaster code-free. By editing the gamemaster, you can preview new Pokemon, craft new moves, test move balance changes, and more.</p>
        <p>Your edits will be saved to your browser's local storage. They will only be available to you on your device. You can share the export code above for others to use and edit your custom gamemaster. Only copy and paste code from a trusted source.</p>
        <h4>Affected Pages</h4>
        <p>Editing the gamemaster will affect information and simulations which are generated at runtime. These include:</p>
        <ul>
            <li>Single Battle, Multi Battle, and Matrix Battle</li>
            <li>Team Builder</li>
            <li>Custom Rankings</li>
            <li>Training</li>
            <li>CMP Chart</li>
            <li>Moves</li>
        </ul>
        <h4>Unaffected Pages</h4>
        <p>Editing the gamemaster will not affect pre-generated information or simulation results. These include:</p>
        <ul>
            <li>Rankings</li>
            <li>Training Analysis/Top Performers</li>
            <li>Article content</li>
        </ul>
    </div>
</div>

<div class="save-new-gm hide">
	<input id="gm_name" name="gm_name" placeholder="Custom Gamemaster name" autocomplete="off" />
    <div class="error-label"></div>
	<p>This will save your custom gamemaster to local storage on your device. Gamemaster names must be unique.</p>
	<div class="center">
		<div id="save-new-modal-btn" class="button">Save & Edit</div>
	</div>
</div>

<div class="import-error hide">
	<p>There was an error importing the custom gamemaster. Ensure that the data is not malformed and contains valid Pokemon and move data.</p>
</div>

<div class="save-data hide">
	<p>Data saved successfully.</p>
</div>

<div class="save-data-error hide">
	<p>There was an error saving the data. Ensure that all entries are valid.</p>
</div>

<div class="delete-gm-confirm hide">
	<p>Delete <b><span class="name"></span></b>? This action can't be undone.</p>

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
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorUtils.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
