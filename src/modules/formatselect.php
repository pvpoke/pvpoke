<select class="format-select">
	<option value="1500" cup="all" meta-group="great">Great League</option>
	<option value="2500" cup="all" meta-group="ultra">Ultra League</option>
	<option value="10000" cup="all" meta-group="master">Master League</option>
</select>

<script>
	// Dynamically add current formats to the format dropdown
	function updateFormatSelect(formats, interfaceMaster){
		for(var i = 0; i < formats.length; i++){
			var showFormat = formats[i].showFormat;

			if((interfaceMaster.context == "rankings")&&(formats[i].hideRankings)){
				showFormat = false;
			}

			if(showFormat){
				$format = $("<option>"+formats[i].title+"</option>");
				$format.attr("value", formats[i].cp);
				$format.attr("cup", formats[i].cup);
				$format.attr("meta-group", formats[i].meta);

				$(".format-select").append($format);
			}
		}
	}

</script>
