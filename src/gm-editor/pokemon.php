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
