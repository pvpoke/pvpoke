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

        <div class="table-container">
            <table class="train-table" cellspacing="0">
                <thead>
                    <tr>
                        <th><a href="#" data="dex">Dex</a></th>
                        <th><a href="#" data="name">Pokemon</a></th>
                        <th>Fast Attacks</th>
                        <th>Charged Attacks</th>
                        <th>Tags</th>
                        <th><a href="#" data="priority">Search<br>Priority</a></th>
                        <th><a href="#" data="released">Released</a></th>
                    </tr>
                    <!--Row html to clone-->
                    <tr class="hide">
                        <td data="dex"></td>
                        <td data="name"></td>
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




<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/gm-editor/GMEditorPokeInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
