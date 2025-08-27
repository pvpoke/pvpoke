<?php

$META_TITLE = 'Pokemon | Gamemaster Editor';

if(isset($_GET['p'])){
	// Put Pokemon names in the meta title

	$name = ucwords(str_replace('_',' ', explode('-', htmlspecialchars($_GET['p']))[0]));

	$META_TITLE = $name . ' | Gamemaster Editor';
}

$META_DESCRIPTION = 'Customize Pokemon or add new Pokemon for your simulations.';

$CANONICAL = '/gm-editor/pokemon/';

require_once '../header.php';
?>

<h1>Gamemaster Editor [Beta]</h1>

<div class="section white" id="gm-editor-pokemon">
    <div class="flex space-between align-items-start">
        <a class="gm-title" href="<?php echo $WEB_ROOT; ?>gm-editor/pokemon/">&larr; All Pokemon</a>
        <div class="ranking-categories mode-select">
            <a class="selected" href="<?php echo $WEB_ROOT; ?>gm-editor/pokemon/">Pokemon</a>
            <a href="<?php echo $WEB_ROOT; ?>gm-editor/moves/">Moves</a>
        </div>
    </div>

    <?php if(isset($_GET['p'])) : ?>
        <!--Edit individual Pokemon-->
        <p class="mt-1">Add or edit a Pokemon entry.</p>
        
        <div class="gm-entry-section">
            <h3>Name &amp; ID's</h3>
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label class="required">Pokemon ID</label>
                    <input id="species-id" name="species-id" type="text" placeholder="Enter Pokemon entry ID" autocomplete="off" maxlength="64" />
                </div>
                <div class="gm-field-wrapper">
                    <label>Pokemon Name</label>
                    <input id="species-name" name="species-name" type="text" placeholder="Enter Pokemon name" autocomplete="off" maxlength="64" />
                </div>
            </div>
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label>Alias ID</label>
                    <input id="alias-id" name="alias-id" type="text" placeholder="Enter alias ID" autocomplete="off" maxlength="64" />
                    <div class="description">Enter an alias if this entry is a duplicate of another entry (for the purposes of ranking multiple movesets).</div>
                </div>
                <div class="gm-field-wrapper">
                    <label class="required">Pokedex Number</label>
                    <input id="dex" name="dex" type="number" placeholder="Enter Pokedex number" />
                </div>
            </div>
            <div class="gm-field-wrapper">
                <label>Nicknames</label>
                <div class="editable-list" data="nicknames"></div>
            </div>
            <div class="gm-field-wrapper flex gap-15">
                <input class="editable-list-input field-mw" type="text" id="add-nickname" name="add-nickname" placeholder="+ Add Nickname (Press Enter)" />
            </div>
        </div>

        <hr>

        <div class="gm-entry-section">
            <h3>Game Data</h3>
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label class="required">Primary Type</label>
                    <select id="primary-type" name="primary-type">
                        <option value="none" selected disabled>Select a type</option>
                    </select>
                </div>
                <div class="gm-field-wrapper">
                    <label>Secondary Type</label>
                    <select id="secondary-type" name="secondary-type">
                        <option value="none" selected>None</option>
                    </select>
                </div>
            </div>
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label>Base Attack</label>
                    <input id="stats-atk" name="stats-atk" data="atk" type="number" placeholder="Enter Base Attack stat" />
                </div>
                <div class="gm-field-wrapper">
                    <label>Base Defense</label>
                    <input id="stats-def" name="stats-def" data="def" type="number" placeholder="Enter Base Defense stat" />
                </div>
                <div class="gm-field-wrapper">
                    <label>Base Stamina (HP)</label>
                    <input id="stats-hp" name="stats-hp" data="hp" type="number" placeholder="Enter Base Stamina (HP) stat" />
                </div>
            </div>

            <div class="gm-field-wrapper">
                <table id="default-iv-table" class="train-table" cellspacing="0">
                    <thead>
                        <th>League</th>
                        <th>Default Level &amp; IV's</th>
                        <th class="desktop">Rank</th>
                        <th class="desktop">CP</th>
                        <tr class="hide">
                            <td data="league">Great</td>
                            <td class="fields">
                                <div class="ivs">
                                    <div class="flex align-items-center">
                                        <input class="level" name="iv-level" data="0" type="number" placeholder="Level" min="1" max="40" step=".5" />
                                        <div class="ivs-group">
                                            <input class="iv" iv="atk" data="1" name="iv-atk" type="number" placeholder="Atk" min="0" max="15" step="1" /><span>/</span>
                                            <input class="iv" iv="def" data="2" name="iv-def" type="number" placeholder="Def" min="0" max="15" step="1" /><span>/</span>
                                            <input class="iv" iv="hp" data="3" name="iv-hp" type="number" placeholder="HP" min="0" max="15" step="1" />
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="desktop" data="rank">150</td>
                            <td class="desktop" data="cp">1500</td>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>

            
            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label>Level Floor</label>
                    <input id="level-floor" name="level-floor" type="number" placeholder="Enter level floor for IV's" />
                    <div class="description">Default IV's won't fall below the level floor where possible.</div>
                </div>
                <div class="gm-field-wrapper">
                    <button id="generate-default-ivs">Generate Default IV's</button>
                </div>
            </div>

            <div class="gm-entry-row">
                <div class="gm-field-wrapper">
                    <label class="required">Buddy Distance</label>
                    <select id="buddy-distance" name="buddy-distance">
                        <option value="" selected disabled>Select buddy distance</option>
                        <option value="1">1km</option>
                        <option value="3">3km</option>
                        <option value="5">5km</option>
                        <option value="20">20km</option>
                    </select>
                </div>
                <div class="gm-field-wrapper">
                    <label class="required">Third Move Cost</label>
                    <select id="third-move-cost" name="third-move-cost">
                        <option value="" selected disabled>Select third move cost</option>
                        <option value="10000">10,000</option>
                        <option value="50000">50,000</option>
                        <option value="75000">75,000</option>
                        <option value="100000">100,000</option>
                    </select>
                </div>
            </div>
        </div>

        <hr>

        <div class="gm-entry-section">
            <h3>Move Data</h3>
            <div class="gm-field-wrapper">
                <label class="required">Fast Move Pool</label>
                <div class="editable-list" data="fastMoves"></div>
            </div>
            <div class="gm-field-wrapper">
                <select class="editable-list-selector field-mw" id="add-fast-move" name="add-fast-move">
                    <option value="NONE" selected disabled>+ Add Fast Move</option>
                </select>
            </div>
            <div class="gm-field-wrapper">
                <label class="required">Charged Move Pool</label>
                <div class="editable-list" data="chargedMoves"></div>
            </div>
            <div class="gm-field-wrapper">
                <select class="editable-list-selector field-mw" id="add-charged-move" name="add-charged-move">
                    <option value="NONE" selected disabled>+ Add Charged Move</option>
                </select>
            </div>
            <div class="gm-field-wrapper">
                <label>Elite TM Moves</label>
                <div class="editable-list" data="eliteMoves"></div>

            </div>
            <div class="gm-field-wrapper">
                <select class="editable-list-selector field-mw" id="add-elite-move" name="add-elite-move">
                    <option value="NONE" selected disabled>+ Add Elite Move</option>
                </select>
                <div class="description">List any of the above moves which can't be learned via TM but can be learned via Elite TM.</div>
            </div>
            <div class="gm-field-wrapper">
                <label>Legacy Moves</label>
                <div class="editable-list-selector editable-list" data="legacyMoves"></div>
            </div>
            <div class="gm-field-wrapper">
                <select class="editable-list-selector field-mw" id="add-legacy-move" name="add-legacy-move">
                    <option value="NONE" selected disabled>+ Add Legacy Move</option>
                </select>
                <div class="description">List any of the above moves which can't be learned via TM or Elite TM.</div>
            </div>
        </div>

        <hr>

        <div class="gm-entry-section">
            <h3>Metadata</h3>
            <div class="gm-field-wrapper">
                <label>Tags</label>
                <div class="editable-list" data="tags"></div>
                <div class="description">Tags provide categorization for Pokemon as well as flags for Pokemon specific features (IV floors, bypassing the stat product filter, duplicating a ranking entry, etc.).</div>
            </div>

            <div class="gm-field-wrapper">
                <select class="editable-list-selector field-mw" id="add-tag" name="add-tag">
                    <option value="NONE" selected disabled>+ Add Tag</option>
                </select>
            </div>

            <div class="gm-field-wrapper">
                <label>Search Priority</label>
                <input id="search-priority" class="field-mw" name="search-priority" type="number" placeholder="Enter Search Priority" />
                <div class="description">Selection order for Pokemon with similar names. Largest value is selected first.</div>
            </div>
            
            <div class="gm-field-wrapper">
                <label>Released</label>
                <div class="form-group field-mw" data="released">
                    <div class="option on" value="yes">Yes</div>
                    <div class="option" value="no">No</div>
                </div>
                <div class="description">Unreleased Pokemon do not appear in bulk simulation results (Multi-Battle, Team Builder, etc.).</div>
            </div>
        </div>

        <hr>

        <div class="flex">
            <div id="save-changes-btn" class="button" disabled>Save Changes</div>
        </div>

    <?php endif; ?>
</div>

<div class="section white custom-rankings-import">
	<h3>Import/Export Pokemon Entry</h3>

	<p>Copy the text below to export this Pokemon entry or paste to overwrite it. Only copy and paste code from a trusted source.</p>

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

<div class="entry-not-found hide">
	<p>The entry you are trying to edit wasn't found. Ensure the previous window has all changes saved or is refreshed with your latest saved data.</p>
</div>

<div class="refresh-prompt hide">
	<p>Data was changed in a different window. <a href="#"><b>Refresh the page</b></a> to prevent your data from being overwritten.</p>
</div>


<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorUtils.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorPokeInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
