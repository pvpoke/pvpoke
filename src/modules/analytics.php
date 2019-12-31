<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo $UA; ?>"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '<?php echo $UA; ?>', {
	  'custom_map': {
		  'dimension1': 'player_type',
		  'dimension2': 'team_position',
		  'dimension3': 'featured_team',
		  'metric1': 'team_rating'
	  }
	});
	
  var UA_ID = '<?php echo $UA; ?>';
</script>