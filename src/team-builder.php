<?php

$META_TITLE = 'Team Builder';

$META_DESCRIPTION = 'Build your team for Pokemon GO Trainer Battles. See how your Pokemon match up offensively and defensively, discover which Pokemon are the best counters to yours, and get suggestions for how to make your team better.';

$CANONICAL = '/team-builder/';

require_once 'header.php';

?>

<h1>Team Builder</h1>

<div class="section league-select-container team-content white">
	<p>Select your Pokemon and movesets below. You'll see how your team matches up against top Pokemon, which Pokemon pose a potential threat, and potential alternatives for your team. You can also use this tool to identify strong team cores and how to break them.</p>
	<?php require 'modules/formatselect.php'; ?>

	<a class="toggle" href="#">Advanced <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content team-advanced">
		<h3 class="section-title">Options</h3>
		<div class="flex poke">
			<div class="team-option">
				<h3>Max Team Size</h3>
				<select class="team-size-select">
					<option value="6" selected>6</option>
					<option value="8">8</option>
				</select>
			</div>
			<div class="team-option">
				<h3>Scorecard Length</h3>
				<select class="scorecard-length-select">
					<option value="10">10</option>
					<option value="20" selected>20</option>
					<option value="30">30</option>
					<option value="40">40</option>
					<option value="60">60</option>
					<option value="80">80</option>
				</select>
			</div>
			<div class="team-option">
				<h3>Shadow Pokemon</h3>
				<div class="check allow-shadows"><span></span>Show Shadow Pokemon in results</div>
			</div>
			<div class="team-option">
				<h3>Recommend XL Pokemon</h3>
				<div class="check allow-xl <?php if($_SETTINGS->xls): echo "on"; endif; ?>"><span></span>Show Pokemon above level 40 in threats and alternatives</div>
			</div>
			<div class="team-option">
				<h3>Allow Same Species</h3>
				<div class="check same-species"><span></span>Allow team to use multiple of the same species</div>
			</div>
			<div class="flex-break"></div>
			<div class="team-option">
				<h3>Shields</h3>
				<select class="shield-select">
					<option value="average" selected>Average (0 & 1)</option>
					<option value="0">No shields</option>
					<option value="1">1 shield</option>
					<option value="2">2 shields</option>
				</select>
			</div>
			<div class="team-option">
				<h3>Shield Baiting</h3>
				<div class="check shield-baiting on"><span></span>Bait shields with low-energy moves</div>
			</div>
		</div>
		<p>Note that links will not currently preserve these advanced settings.</p>
		<div class="flex">
			<div class="flex-section">
				<h3 class="section-title">Custom Threats</h3>
				<p>Enter a custom group of Pokemon to evaluate threats. These Pokemon will also make up the meta scorecard.</p>
				<div class="team-build custom-threats">
					<?php require 'modules/pokemultiselect.php'; ?>
				</div>
			</div>
			<div class="flex-section">
				<h3 class="section-title">Custom Alternatives</h3>
				<p>Enter a custom group of Pokemon to evaluate alternatives. These will appear as suggestions for your team.</p>
				<div class="team-build custom-alternatives">
					<?php require 'modules/pokemultiselect.php'; ?>
				</div>
			</div>
			<div class="flex-section">
				<h3 class="section-title">Exclude Threats</h3>
				<p>Exclude these Pokemon from the list of threats.</p>
				<div class="team-build exclude-threats">
					<?php require 'modules/pokemultiselect.php'; ?>
				</div>
			</div>
			<div class="flex-section">
				<h3 class="section-title">Exclude Alternatives</h3>
				<p>Exclude these Pokemon from your suggested alternatives.</p>
				<div class="team-build exclude-alternatives">
					<?php require 'modules/pokemultiselect.php'; ?>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="section team-build team poke-select-container">
	<?php require 'modules/pokemultiselect.php'; ?>
</div>

<button class="rate-btn button">
	<span class="btn-content-wrap">
		<span class="btn-icon btn-icon-team"></span>
		<span class="btn-label">Rate Team</span>
	</span>
</button>

<div class="section white error">Please select one or more Pokemon.</div>

<?php require 'modules/ads/body-728.php'; ?>

<div class="section typings white">
	<a href="#" class="toggle active">Overview <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content article">
		<p>Below is a high-level evaluation of your team. Use this as a general guideline for any adjustments you may want to make. Some unique strategies can score lower marks.</p>
		<div class="overview-section coverage">
			<div class="flex">
				<h3>Coverage</h3>
				<div class="grade"></div>
			</div>
			<div class="notes">
				<div grade="A">This team has excellent coverage against top meta threats. It has few or no major vulnerabilities.</div>
				<div grade="B">This team covers most top meta threats. There may be a few vulnerabilities to look out for.</div>
				<div grade="C">This team has coverage gaps and may be vulnerable to certain threats. Consider alternative picks or movesets to shore up your weaknesses.</div>
				<div grade="D">This team is highly vulnerable to certain threats. Consider alternative picks to avoid doubling up on weaknesses or look for Pokemon that perform well against the top meta.</div>
				<div grade="F">This team has extremely poor coverage against multiple threats. Consider strong meta alternatives to anchor this team.</div>
			</div>
		</div>
		<div class="overview-section bulk">
			<div class="flex">
				<h3>Bulk</h3>
				<div class="grade"></div>
			</div>
			<div class="notes">
				<div grade="A">This team has excellent average bulk. It will help manage shields and overcome difficult scenarios.</div>
				<div grade="B">This team has good average bulk. Make sure to save shields for your more fragile teammates.</div>
				<div grade="C">This team has moderate average bulk. You may be pressured to shield more often. Consider a bulky alternative to absorb damage.</div>
				<div grade="D">This team has low average bulk. You will be pressured to shield often. Consider bulkier alternatives to ease shield pressure.</div>
				<div grade="F">This team is extremely fragile and will have a hard time climbing out of bad situations. Use bulkier Pokemon to make this team more forgiving.</div>
			</div>
		</div>
		<div class="overview-section safety">
			<div class="flex">
				<h3>Safety</h3>
				<div class="grade"></div>
			</div>
			<div class="notes">
				<div grade="A">This team has extremely safe matchups. It's flexible and can easily pivot to regain advantage.</div>
				<div grade="B">This team has mostly safe matchups. It can work back from lost leads and has options to escape disadvantageous scenarios.</div>
				<div grade="C">This team has only somewhat safe matchups. It may have limited safe switch options or struggle without switch advantage. Consider alternatives with good bulk or coverage to provide more flexibility. Otherwise, be prepared to spend shields to line up your Pokemon in the right matchups.</div>
				<div grade="D">This team has generally unsafe matchups. It may rely on winning the lead and maintaining switch advantage. Consider safer alternatives with broader coverage.</div>
				<div grade="F">This team has very unsafe matchups. It relies heavily on winning the lead and lining up perfect counters. Consider more flexible alternatives to make your matchups safer.</div>
			</div>
		</div>
		<div class="overview-section consistency">
			<div class="flex">
				<h3>Consistency</h3>
				<div class="grade"></div>
			</div>
			<div class="notes">
				<div grade="A">This team has extremely consistent movesets. It will have dependable damage output.</div>
				<div grade="B">This team has mostly consistent movesets. It won't depend on baits often.</div>
				<div grade="C">This team has movesets with mixed consistency. You might depend on baits every now and then.</div>
				<div grade="D">This team has movesets with low consistency. You'll depend on baits or stat boosts often. Consider alternatives with more consistent Fast or Charged Move damage.</div>
				<div grade="F">This team has many movesets with poor consistency. You'll be highly dependent on landing baits or triggering stat boosts. Consider alternatives that have more dependable movesets.</div>
			</div>
		</div>
	</div>
	<a href="#" class="toggle active">Meta Scorecard <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content article">
		<p>Explore how the top ranked Pokemon match up against your team below. Print this scorecard or save a screenshot for reference as you practice. Remember to prepare beforehand and follow timely play in tournaments!</p>
		<div class="table-container">
			<table class="meta-table rating-table" cellspacing="0">
			</table>
		</div>
		<div class="results-buttons">
			<a href="#" class="button print-scorecard">Print</a>
			<a href="#" class="button download-csv">Export All Matchups to CSV</a>
		</div>

		<table class="rating-table legend" cellspacing="0">
			<tbody>
				<tr>
					<td><a href="#" class="rating win" target="_blank"><span></span></a></td>
					<td><b>Win:</b> This Pokemon wins decisively in most scenarios. It would take a big HP or energy difference to flip this matchup. This Pokemon can usually safely switch and win.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating close-win" target="_blank"><span></span></a></td>
					<td><b>Close Win:</b> This Pokemon is favored, but the matchup can flip depending on HP, energy, baits, or IV's. This Pokemon may not be able to safely switch and win.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating tie" target="_blank"><span></span></a></td>
					<td><b>Tie:</b> Neither Pokemon is favored. This matchup can flip depending on HP, energy, baits, IV's or, Charged Move priority.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating close-loss" target="_blank"><span></span></a></td>
					<td><b>Close Loss:</b> This Pokemon is usually at a disadvantage, but the matchup can flip depending on HP, energy, baits, or IV's.</td>
				</tr>
				<tr>
					<td><a href="#" class="rating loss" target="_blank"><span></span></a></td>
					<td><b>Loss:</b> This Pokemon loses decisively in most scenarios. It would take a big HP or energy difference to flip this matchup.</td>
				</tr>
			</tbody>
		</table>
	</div>

	<a href="#" class="toggle active">Potential Threats <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content article">
		<p>The Pokemon below have the best overall matchups against this team. Results are taken from 0 and 1 shield simulations. Scores also factor in a Pokemon's overall strength and consistency.</p>
		<div class="table-container">
			<table class="threats-table rating-table" cellspacing="0">
			</table>
		</div>
		<p class="center">This team has a threat score of <b class="threat-score"></b></p>
		<p class="small"><strong>Threat score</strong> measures how vulnerable your team may be to specific Pokemon. The smaller the number, the better. It factors in how many Pokemon on your team can be threatened, how hard they're threatened, a threat's overall ranking (how likely you may be to encounter it), and how consistently it performs.</p>
	</div>

	<a href="#" class="toggle active">Potential Alternatives <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content article">
		<p>The Pokemon below have the best overall matchups against this team's potential threats. Results are taken from 0 and 1 shield simulations. Scores also factor in a Pokemon's overall strength and consistency. See the team's Coverage grade for more on its potential threats.</p>

		<div class="poke-search-container">
			<input class="poke-search" context="alternative-search" type="text" placeholder="Search Pokemon" />
			<a href="#" class="search-info">i</a>
			<a href="#" class="search-traits" title="Search Traits">+</a>
		</div>

		<div class="table-container">
			<table class="alternatives-table rating-table" cellspacing="0">
			</table>
		</div>
	</div>

	<a href="#" class="toggle active">Battle Histograms <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<p>The charts below show how many good or bad matchups each Pokemon has among all matchups possible. A Battle Rating below 500 is a loss, and a Battle Rating above 500 is a win. You can compare previous results to examine different Pokemon, movesets, or stats.</p>
		<div class="histograms">
			<div class="histogram"></div>
			<div class="histogram"></div>
			<div class="histogram"></div>
			<div class="histogram"></div>
			<div class="histogram"></div>
			<div class="histogram"></div>
		</div>
	</div>

	<a href="#" class="toggle active">Defensive Typing <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<div class="summary defense-summary"></div>
		<div class="defense"></div>
	</div>

	<a href="#" class="toggle active">Offensive Typing <span class="arrow-down">&#9660;</span><span class="arrow-up">&#9650;</span></a>
	<div class="toggle-content">
		<div class="summary offense-summary"></div>
		<div class="offense"></div>
	</div>

	<div class="share-link-container">
		<p>Share this team:</p>
		<div class="share-link">
			<input type="text" value="" readonly>
			<div class="copy">Copy</div>
		</div>
	</div>
</div>

<?php require_once 'modules/search-string-help.php'; ?>
<?php require_once 'modules/search-traits.php'; ?>

<!--test 4-->
<script src="<?php echo $WEB_ROOT; ?>js/GameMaster.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/pokemon/Pokemon.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/TeamInterface.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeMultiSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/Pokebox.js?=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSelect.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/BattleHistogram.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/ModalWindow.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/interface/PokeSearch.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineEvent.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TimelineAction.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/Battle.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/battle/TeamRanker.js?v=<?php echo $SITE_VERSION; ?>"></script>
<script src="<?php echo $WEB_ROOT; ?>js/Main.js?v=3"></script>

<?php require_once 'footer.php'; ?>
