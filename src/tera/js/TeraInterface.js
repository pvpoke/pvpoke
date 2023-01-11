var InterfaceMaster = (function () {
    var instance;

    function createInstance() {


        var object = new interfaceObject();

		function interfaceObject(){

			let self = this;
			let ranker = new TeraRanker();

			this.init = function(){

			}

			$("button#run").click(function(e){
				let types = [];

				types.push($("#type1 option:selected").val());

				if($("#type2 option:selected").val() != "none"){
					types.push($("#type2 option:selected").val());
				}

				let tera = $("#tera option:selected").val()

				let results = ranker.rankAttackers(types, tera);

				$("#results tbody").html("");

				for(var i = 0; i < 50; i++){
					let $row = $('<tr><td></td><td>-</td><td></td></tr>');
					$row.find("td").eq(0).html(results[i].types[0]);

					if(results[i].types.length > 1){
						$row.find("td").eq(1).html(results[i].types[1]);
					}

					$row.find("td").eq(2).html(results[i].tera);
					$("#results tbody").append($row);
				}
			});

		}

        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
