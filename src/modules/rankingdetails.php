<div class="details-template hide">
	<div class="detail-section detail-tab-nav">
		<a class="tab-moves active" href="#" tab="matchups"><span class="icon"></span>Matchups</a>
		<a class="tab-moves" href="#" tab="moves"><span class="icon"></span>Moves</a>
		<a class="tab-stats" href="#" tab="stats"><span class="icon"></span>Stats</a>
		<a class="tab-moves" href="#" tab="misc"><span class="icon"></span>Misc</a>
	</div>

	<div class="detail-tab active" tab="matchups">
		<div class="detail-section float margin">
			<div class="ranking-header">Key Wins</div>
			<div class="ranking-header right">Battle Rating</div>
			<div class="matchups clear"></div>
		</div>
		<div class="detail-section float">
			<div class="ranking-header">Key Losses</div>
			<div class="ranking-header right">Battle Rating</div>
			<div class="counters clear"></div>
		</div>

		<div class="multi-battle-link"><p>See all of <b class="name"></b> matchups:</p><a target="_blank" class="button" href="#">Pokemon vs. Great League</a></div>
	</div><!-- end tab matchups-->

	<div class="detail-tab" tab="stats">
		<div class="detail-section performance float margin">
			<div class="ranking-header">Performance</div>
			<button class="ranking-compare">Compare</button>
			<div class="hexagon-container">
				<div class="chart-label">
					<div class="value">0</div>
					<div class="label">Lead</div>
					<div class="comparison"></div>
				</div>
				<div class="chart-label">
					<div class="value">0</div>
					<div class="label">Closer</div>
					<div class="comparison"></div>
				</div>
				<div class="chart-label">
					<div class="value">0</div>
					<div class="label">Switch</div>
					<div class="comparison"></div>
				</div>
				<div class="chart-label">
					<div class="value">0</div>
					<div class="label">Charger</div>
					<div class="comparison"></div>
				</div>
				<div class="chart-label">
					<div class="value">0</div>
					<div class="label">Attacker</div>
					<div class="comparison"></div>
				</div>
				<div class="chart-label">
					<div class="value">0</div>
					<div class="label">Consistency</div>
					<div class="comparison"></div>
				</div>
				<canvas class="hexagon"></canvas>
			</div>

		</div>
		<div class="detail-section poke-stats float">
			<div class="ranking-header">Stats</div>
			<a target="_blank" class="button ranking-cmp-link" href="#">CMP Chart</a>
			<div class="stat-details clear">
				<div class="stat-row">
					<div class="label">Attack</div>
					<div class="value">0</div>
					<div class="bar-container">
						<div class="bar"></div>
						<div class="bar shadow"></div>
						<div class="shadow-mult">+20%</div>
					</div>
				</div>
				<div class="stat-row">
					<div class="label">Defense</div>
					<div class="value">0</div>
					<div class="bar-container">
						<div class="bar"></div>
						<div class="bar shadow"></div>
						<div class="shadow-mult">-20%</div>
					</div>
				</div>
				<div class="stat-row">
					<div class="label">Stamina</div>
					<div class="value">0</div>
					<div class="bar-container">
						<div class="bar"></div>
					</div>
				</div>
				<div class="stat-row overall">
					<div class="label">Overall</div>
					<div class="value">0</div>
					<div class="bar-container">
						<div class="bar"></div>
					</div>
				</div>
				<div class="stat-row level">
					<div class="label">Level</div>
					<div class="value">0</div>
				</div>
				<div class="stat-row rank-1">
					<div class="label">Rank 1</div>
					<div class="value">0</div>
				</div>
				<div class="stat-row xl-info-container">
					<div class="label"><div class="icon"></div></div>
					<div class="xl-info regular hide">No Candy XL required.</div>
					<div class="xl-info mixed hide">Candy XL recommended but not required.</div>
					<div class="xl-info xl hide">Candy XL strongly recommended.</div>
					<div class="xl-info unavailable hide">Candy XL not readily available yet for this Pokemon.</div>
					<div class="xl-info xs hide">This entry respresents this Pokemon without the use of Candy XL.</div>
				</div>
			</div>
		</div>
		<div class="detail-section notes-container hide">
			<div class="ranking-header editor-score-header">Editor's Score <a href="#" class="info-icon editor-score-info">?</a></div>
			<div class="flex">
				<div class="editor-score">
					100
				</div>
				<div class="editor-notes">
					asdfasdfas
				</div>
			</div>
		</div>
		<div class="detail-section traits-container">
			<div class="ranking-header">Traits <a href="#" class="info-icon trait-info">?</a></div>
			<div class="traits"></div>
		</div>
	</div><!-- end tab stats-->

	<div class="detail-tab" tab="moves">
		<div class="detail-section float margin">
			<div class="ranking-header">Fast Moves</div>
			<!--<div class="ranking-header stat-toggle"><a class="show-move-stats" href="#">Show Stats</a></div>-->
			<div class="moveset fast show-stats clear">
				<div class="move-detail-template rank hide">
					<div class="name-container flex">
						<span class="name">Counter</span>
						<span class="archetype"><span class="name"></span><span class="icon"></span></span>
					</div>
					<div class="stats-container name-container flex">
						<div class="dpt"><b class="value">0</b> dpt</div>
						<div class="ept"><b class="value">0</b> ept</div>
						<div class="turns"><b class="value">0</b> turns</div>
					</div>
				</div>
			</div>
			<div class="rank selected recommended">Recommended move</div>
			<div class="footnote">
				* Event or Elite TM exclusive<br>
				<sup>†</sup> Unobtainable via TM<br><br>
				<div>Move stats include same type and Shadow attack bonuses.</div>
			</div>
		</div>
		<div class="detail-section float">
			<div class="ranking-header">Charged Moves</div>
			<div class="moveset charged show-stats clear">
				<div class="move-detail-template rank hide">
					<div class="name-container flex">
						<span class="name">Counter</span>
						<span class="archetype"><span class="name"></span><span class="icon"></span></span>
					</div>
					<div class="stats-container name-container flex">
						<div class="damage"><b class="value">0</b> damage</div>
						<div class="energy"><b class="value">0</b> energy</div>
						<div class="dpe"><b class="value">0</b> dpe</div>
					</div>
					<div class="stats-container name-container move-effect flex"></div>
					<div class="stats-container name-container move-count"><div>Fast Move Count: <span></span></div></div>
				</div>
			</div>
		</div>
	</div><!-- end tab moves-->

	<div class="clear"></div>

	<div class="detail-tab" tab="misc">
		<div class="detail-section typing">
			<div class="rating-container">
				<div class="ranking-header">Primary Type</div>
				<div class="type"></div>
			</div>
			<div class="rating-container">
				<div class="ranking-header">Secondary Type</div>
				<div class="type"></div>
			</div>
		</div>
		<div class="detail-section float margin">
			<div class="ranking-header">Weaknesses</div>
			<div class="weaknesses clear"></div>
		</div>
		<div class="detail-section float">
			<div class="ranking-header">Resistances</div>
			<div class="resistances clear"></div>
		</div>
		<div class="clear"></div>
		<div class="detail-section float margin">
			<div class="ranking-header">Buddy Distance</div>
			<div class="buddy-distance clear"></div>
		</div>
		<div class="detail-section float">
			<div class="ranking-header">Charged Move Cost</div>
			<div class="third-move-cost clear"></div>
		</div>
		<div class="detail-section partner-pokemon">
			<div class="ranking-header">Suggested Teammates</div>
			<div class="footnote">
				Get a quick start to team building with these Pokemon:
			</div>
			<div class="list"></div>
		</div>
		<div class="clear"></div>
		<div class="detail-section similar-pokemon">
			<div class="ranking-header">Similar Pokemon</div>
			<div class="list"></div>
		</div>
	</div><!--end tab misc-->

	<div class="share-link detail-section"><input type="text" readonly="">
		<div class="copy">Copy</div>
	</div>
</div>

<div class="trait-modal hide">
	<p><b class="name"></b> has the following traits and playstyles:</p>

	<div class="traits">
	</div>
</div>

<div class="editor-score-modal hide">
	<p>An Editor's Score is assigned to provide commentary on meta relevant Pokemon or improve accuracy for Pokemon whose simulated scores may not reflect their in-game performance. In these cases, a Pokemon's overall score is a combination of both the editor's score and its simulated performance.</p>
	<p>Editor scores follow the guide below:</p>
	<table class="train-table" cellspacing="0">
		<thead>
			<th>Editor's Score</th>
			<th>Description</th>
		</thead>
		<tbody>
			<tr>
				<td>100</td>
				<td>Undisputed best Pokemon in the format, meta defining and dominating picks with little to no drawbacks.</td>
			</tr>
			<tr>
				<td>95</td>
				<td>Top meta Pokemon with high usage and consistent competitive play, may have a minor drawback or weakness.</td>
			</tr>
			<tr>
				<td>90</td>
				<td>Strong and typically meta Pokemon but not overused or centralizing, may have one or two drawbacks.</td>
			</tr>
			<tr>
				<td>85</td>
				<td>Competitive Pokemon which may be underused, outside the meta, anti-meta, or considered a downgrade to meta picks.</td>
			</tr>
			<tr>
				<td>80</td>
				<td>Viable but challenging Pokemon with significant drawbacks, generally spice picks. May require expert hands.</td>
			</tr>
			<tr>
				<td>75 or below</td>
				<td>Not competitively relevant, low or inconsistent performance with multiple significant drawbacks.</td>
			</tr>
		</tbody>
	</table>
</div>
