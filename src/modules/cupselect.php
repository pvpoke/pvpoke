<select class="cup-select">
	<option value="all" cup="all" meta-group500="littlegeneral" meta-group1500="great" meta-group2500="ultra" meta-group10000="master">Open League</option>
</select>

<script>
	// Dynamically add current formats to the format dropdown
	function updateCupSelect(formats, interfaceMaster){
		for(var i = 0; i < formats.length; i++){
			if(formats[i].showCup){
				$format = $("<option>"+formats[i].title+"</option>");
				$format.attr("value", formats[i].cup);
				$format.attr("meta-group"+formats[i].cp, formats[i].meta);
				$format.attr("cp", formats[i].cp);

				$(".cup-select").append($format);
			}
		}
	}

</script>
