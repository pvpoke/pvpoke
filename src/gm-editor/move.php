<?php

$META_TITLE = 'Moves | Gamemaster Editor';

$META_DESCRIPTION = 'Customize moves or add new moves for your simulations.';


require_once '../header.php';
?>

<h1>Gamemaster Editor</h1>

<div class="section white" id="gm-editor-pokemon">
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
                <div class="gm-entry-row">
                    <div class="gm-field-wrapper">
                        <label class="required">Base Power</label>
                        <input id="move-power" name="move-power" step="1" type="number" placeholder="Enter base power" autocomplete="off" />
                    </div>
                    <div class="gm-field-wrapper">
                        <label class="required">Energy</label>
                        <input id="move-energy" name="move-energy" step="5" type="number" placeholder="Enter energy gain/cost" autocomplete="off" />
                        <div class="description">A positive value for the move's energy gain or energy cost.</div>
                    </div>
                </div>
                <div class="gm-field-wrapper fast-only">
                    <label class="required">Duration (Turns)</label>
                    <input id="move-turns" name="move-turns" class="field-mw" step="1" type="number" placeholder="Enter move duration" autocomplete="off" />
                </div>
                <div class="gm-entry-row">
                    <div class="gm-field-wrapper">
                        <label>Move Effect</label>
                        <div class="form-group" data="move-effect">
                            <div class="option" value="yes">Yes</div>
                            <div class="option on" value="no">No</div>
                        </div>
                    </div>
                    <div class="gm-field-wrapper">
                        <label>Effect Target</label>
                        <select id="effect=target" name="effect-target" class="move-effect-field">
                            <option value="" selected disabled>Select effect target</option>
                            <option value="self">Attacker</option>
                            <option value="opponent">Defender</option>
                            <option value="both">Both</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

    <?php endif; ?>
</div>


<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
