<?php

$META_TITLE = 'Moves | Gamemaster Editor';

if(isset($_GET['m'])){
	// Put Pokemon names in the meta title

	$name = ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['m']))[0]));

	$META_TITLE = $name . ' | Gamemaster Editor';
}

$META_DESCRIPTION = 'Customize moves or add new moves for your simulations.';

$CANONICAL = '/gm-editor/moves/';

require_once '../header.php';
?>

<h1>Gamemaster Editor</h1>

<div class="section white" id="gm-editor-moves">
    <div class="flex space-between align-items-start">
        <a class="gm-title" href="<?php echo $WEB_ROOT; ?>gm-editor/moves/">&larr; All Moves</a>
        <div class="ranking-categories mode-select">
            <a href="<?php echo $WEB_ROOT; ?>gm-editor/pokemon/">Pokemon</a>
            <a class="selected" href="<?php echo $WEB_ROOT; ?>gm-editor/moves/">Moves</a>
        </div>
    </div>

    <?php if(isset($_GET['m'])) : ?>
        <!--Edit individual move-->
        <p class="mt-1">Add or edit a move entry.</p>
        
        <div class="gm-entry-section">
            <h3>Name &amp; ID's</h3>
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label class="required">Move ID</label>
                    <input id="move-id" name="move-id" type="text" placeholder="Enter move entry ID" autocomplete="off" maxlength="64" />
                </div>
                <div class="gm-field-wrapper">
                    <label>Move Name</label>
                    <input id="move-name" name="move-name" type="text" placeholder="Enter move name" autocomplete="off" maxlength="64" />
                </div>
            </div>
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label>Abbreviation</label>
                    <input class="field-mw" id="abbreviation" name="abbreviation" type="text" placeholder="Enter move abbreviation" autocomplete="off" maxlength="4" />
                    <div class="description">Override the move's default abbreviation.</div>
                </div>
            </div>
        </div>

        <hr>

        <div class="gm-entry-section">
            <h3>Game Data</h3>
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label class="required">Type</label>
                    <select id="move-type" name="move-type">
                        <option value="none" selected disabled>Select a type</option>
                    </select>
                </div>
                <div class="gm-field-wrapper">
                    <label class="required">Category</label>
                    <div class="form-group field-mw" data="category">
                        <div class="option on" value="fast">Fast</div>
                        <div class="option" value="charged">Charged</div>
                    </div>
                </div>
            </div>
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label class="required">Base Power</label>
                    <input id="move-power" name="move-power" step="1" type="number" placeholder="Enter base power" />
                </div>
                <div class="gm-field-wrapper">
                    <label class="required">Energy</label>
                    <input id="move-energy" name="move-energy" step="5" type="number" placeholder="Enter energy gain/cost" />
                    <div class="description">Positive value for the move's energy gain or energy cost.</div>
                </div>
            </div>
            <div class="gm-field-wrapper fast-only">
                <label class="required">Duration (Turns)</label>
                <input id="move-turns" name="move-turns" class="field-mw" step="1" type="number" placeholder="Enter move duration" />
            </div>
            <div class="gm-entry-row charged-only">
                <div class="gm-field-wrapper">
                    <label>Move Effect</label>
                    <select id="move-effect" name="move-effect" class="field-mw">
                        <option value="none">None</option>
                        <option value="self">Attacker Stat Modifier</option>
                        <option value="opponent">Defender Stat Modifier</option>
                        <option value="both">Both</option>
                    </select>
                </div>
                <div class="gm-field-wrapper move-effect-field">
                    <label>Effect Chance</label>
                    <input id="effect-apply-chance" name="effect-apply-chance" type="number" placeholder="Enter move effect chance" min="0" max="1" step=".1" />
                    <div class="description">Decimal between 0 and 1 (1 = 100% chance).</div>
                </div>
            </div>
            <div class="gm-entry-row move-effect-field stat-modifiers">
                <div class="gm-field-wrapper">
                    <label>Attacker Stat Modifiers</label>
                    <div class="fields">
                        <div class="ivs flex gap-15">
                            <input id="attacker-stat-atk" name="attacker-stat-atk" type="number" placeholder="Atk" min="-4" max="4" step="1" />
                            <input id="attacker-stat-def" name="attacker-stat-def" type="number" placeholder="Def" min="-4" max="4" step="1" />
                        </div>
                        <div class="flex gap-15">
                            <label class="iv">Atk</label>
                            <label class="iv">Def</label>
                        </div>
                    </div>
                </div>
                <div class="gm-field-wrapper">
                    <label>Defender Stat Modifiers</label>
                    <div class="fields">
                        <div class="ivs flex gap-15">
                            <input id="defender-stat-atk" name="defender-stat-atk" type="number" placeholder="Atk" min="-4" max="4" step="1" />
                            <input id="defender-stat-def" name="defender-stat-def" type="number" placeholder="Def" min="-4" max="4" step="1" />
                        </div>
                        <div class="flex gap-15">
                            <label class="iv">Atk</label>
                            <label class="iv">Def</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <hr>

        <div class="gm-entry-section">
            <h3>Metadata</h3>
            <div class="gm-field-wrapper">
                <label class="required">Archetype</label>
                <select id="move-archetype" name="move-archetype" class="field-mw">
                    <option value="none" selected disabled>Select an archetype</option>
                </select>
                <div class="description">Only used as a description in the rankings.</div>
            </div>
        </div>

        <hr>

        <div class="flex">
            <div id="save-changes-btn" class="button" disabled>Save Changes</div>
        </div>

    <?php endif; ?>
</div>

<div class="section white" id="gm-editor-learnset">
	<h3>Learnset</h3>

	<p>Add this move to a Pokemon's move pool or remove it below.</p>

	<div class="gm-entry-section">
        <div class="gm-field-wrapper">
            <div class="editable-list-selector editable-list" data="learnset"></div>
        </div>
        <div class="gm-field-wrapper">
            <select class="editable-list-selector field-mw" id="add-learnset" name="add-learnset">
                <option value="NONE" selected disabled>+ Add Move to Pokemon</option>
            </select>
        </div>
    </div>
</div>

<div class="section white custom-rankings-import">
	<h3>Import/Export Move Entry</h3>

	<p>Copy the text below to export this move entry or paste to overwrite it. Only copy and paste code from a trusted source.</p>

	<textarea class="import"></textarea>
	<div class="copy">Copy</div>
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


<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorUtils.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorMoveInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
