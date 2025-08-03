<?php

$META_TITLE = 'Gamemaster Editor | Moves';

$META_DESCRIPTION = 'Customize moves or add new moves for your simulations.';


require_once '../header.php';
?>

<h1>Gamemaster Editor</h1>

<?php if(! isset($_GET['p'])) : ?>
    <!--All Pokemon table-->
    <div class="section white" id="gm-editor-pokemon">
        <?php require_once 'gm-editor-header.php'; ?>
        <p class="mt-1">Customize moves or add new moves for your simulations.</p>
    </div>
<?php else: ?>
    <!--Edit individual Pokemon-->
    <div class="section white" id="gm-editor-pokemon">
        <?php require_once 'gm-editor-header.php'; ?>
        <p class="mt-1">Customize moves or add new moves for your simulations.</p>
    </div>
<?php endif; ?>


<?php require_once '../modules/scripts/battle-scripts.php'; ?>

<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/devtools/GMEditorInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=<?php echo $SITE_VERSION; ?>"></script>

<?php require_once '../footer.php'; ?>
