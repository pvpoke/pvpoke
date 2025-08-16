class GMEditorUtils{
    // This method returns a Pokemon or Move ID given a string
    static StringToID(string, fieldName){

        let id = string.toLowerCase().replace(/[^a-zA-Z]/g, "_");

        switch(fieldName){

        }

        return id;
    }

    static RemoveSpecialCharacters(string){
        string = string.replace(/[^a-z0-9áéíóúñü \.\,\_\-\?\!\(\)\&%]/gim,"");
        return string.trim();
    }

    // Validate a full gamemaster entry
    static ValidateGamemaster(entry){
        let fieldErrors = [];
        let validations = GMEditorValidations.gamemaster;

        validations.forEach(validation => {
            let propertyErrors = GMEditorUtils.ValidateField("gamemaster", validation.property, entry[validation.property]);

            if(propertyErrors.length > 0){
                fieldErrors.push({
                    fieldName: validation.field,
                    errors: propertyErrors
                });
            }
        });

        return fieldErrors;
    }

    // Validate a full Pokemon entry
    static ValidatePokemonEntry(entry){
        //let properties = ["speciesId", "speciesName", "aliasId", "dex", "nicknames", "baseStats", "types", "fastMoves", "chargedMoves", "eliteMoves", "legacyMoves", "defaultIVs", "buddyDistance", "thirdMoveCost", "released", "searchPriority", "tags"];

        let fieldErrors = [];
        let validations = GMEditorValidations.pokemon;

        validations.forEach(validation => {
            if(validation?.notBaseProperty){
                return;

            }
            let propertyErrors = GMEditorUtils.ValidateField("pokemon", validation.property, entry[validation.property]);

            if(propertyErrors.length > 0){
                fieldErrors.push({
                    speciesId: entry.speciesId,
                    fieldName: validation.field,
                    errors: propertyErrors
                });
            }
        });

        // Validate that the Pokemon can initialize in all leagues
        let leagues = [500, 1500, 2500, 10000];
        let battle = new Battle();

        try{
            leagues.forEach(cpLimit => {
                battle.setCP(cpLimit);

                let pokemon = new Pokemon(null, 0, battle, entry);
                pokemon.initialize(true);

                if(isNaN(pokemon.cp) || pokemon.cp > cpLimit){
                    throw "Pokemon invalid CP: " + pokemon.cp;
                }
            });
        } catch(e){
            console.error("Could not initialize " + entry.speciesId);
            console.error(e);
            fieldErrors.push({
                fieldName: "",
                errors: ["Pokemon could not be initialized with current data."]
            });
        }

        return fieldErrors;
    }

    // Validate a full move entry
    static ValidateMoveEntry(entry){
        let fieldErrors = [];
        let validations = GMEditorValidations.move;

        validations.forEach(validation => {
            let propertyErrors = GMEditorUtils.ValidateField("move", validation.property, entry[validation.property]);

            if(propertyErrors.length > 0){
                fieldErrors.push({
                    moveId: entry.moveId,
                    fieldName: validation.field,
                    errors: propertyErrors
                });
            }
        });

        return fieldErrors;
    }


    // Validate a field given its value and validations
    static ValidateField(objectType, fieldName, value){
        let errors = [];
        let validations = GMEditorValidations[objectType].find(v => v.field == fieldName || v.property == fieldName)?.validations;

        if(! validations || ! validations?.length){
            validations = [];
        }

        let gm = GameMaster.getInstance();

        for(let validation of validations){
            switch(validation.type){
                case "required":
                    if(value !== 0 && (! value || value?.length == 0 || value === "")){
                        errors.push("Field is required.");
                        return errors;
                    }
                    break;

                case "string_min_length":
                    if(value?.length < validation.value){
                        errors.push("Field is too short (min " + validation.value + ").");
                    }
                    break;

                case "string_max_length":
                    if(value?.length > validation.value){
                        errors.push("Field is too long (max " + validation.value + ").");
                    }
                    break;

                case "number":
                    if(isNaN(value)){
                        errors.push("Field must be a number");
                    }
                    break;

                case "number_min_value":
                    if(value < validation.value){
                        errors.push("Field is below the minimum (" + validation.value + ").");
                    }
                    break;

                case "number_max_value":
                    if(value > validation.value){
                        errors.push("Field is above the maximum (" + validation.value + ").");
                    }
                    break;

                case "integer":
                    if(isNaN(value) || ! Number.isInteger(value)){
                        errors.push("Field must be an integer.");
                    }
                    break;

                case "type":
                    if(! Pokemon.getAllTypes(true).includes(value)){
                        errors.push("Field must be a valid Pokemon type.")
                    }
                    break;

                case "types":
                    if(value?.length != 2){
                        errors.push("Pokemon must have valid types.")
                    } else if(! Pokemon.getAllTypes(true).includes(value[0])){
                        errors.push("Pokemon must have valid types.")
                    } else if(! Pokemon.getAllTypes(true).includes(value[1]) && value[1] != "none"){
                        errors.push("Pokemon must have valid types.")
                    }
                    break;

                case "unique_id":
                    switch(fieldName){
                        case "speciesId":
                        case "species-id":
                            if(gm.data.pokemon.filter(pokemon => pokemon?.speciesId?.toLowerCase() == value?.toLowerCase()).length > 1){
                                errors.push("This Pokemon ID already exists.")
                            }
                            break;

                        case "moveId":
                            if(gm.data.moves.filter(move => move?.moveId?.toLowerCase() == value?.toLowerCase()).length > 1){
                                errors.push("This Move ID already exists.")
                            }
                            break;
                    }
                    break;

                case "existing_id":
                    switch(fieldName){
                        case "aliasId":
                        case "alias-id":
                            if(value !== "" && value !== undefined && value !== null &&
                                gm.data.pokemon.filter(pokemon => pokemon?.speciesId?.toLowerCase() == value?.toLowerCase()).length == 0){
                                errors.push("Field must match an existing ID.")
                            }
                            break;
                    }
                    break;

                case "baseStats":
                    if(! value.hasOwnProperty("atk") || ! value.hasOwnProperty("def") || ! value.hasOwnProperty("hp")){
                        errors.push("All fields are required.")
                        break;
                    }

                    errors = [
                        ...errors,
                        ...GMEditorUtils.ValidateField("pokemon", "baseStat", value.atk),
                        ...GMEditorUtils.ValidateField("pokemon", "baseStat", value.def),
                        ...GMEditorUtils.ValidateField("pokemon", "baseStat", value.hp),
                    ];
                    break;

                case "whitelist":
                    if(! validation.value.includes(value)){
                        errors.push("Field is not set to an allowed value.");
                    }
                    break;

                case "blacklist":
                    if(validation.value.includes(value)){
                        errors.push("Field is an invalid value.")
                    }
                    break;

                case "regex":
                    let regex = new RegExp(validation.value);
                    if(! regex.test(value)){
                        errors.push("Field has illegal characters or pattern.")
                    }
                    break;

                case "all_pokemon":                   
                    if(value?.forEach){
                        value.forEach(pokemon => {
                            let pokemonErrors = GMEditorUtils.ValidatePokemonEntry(pokemon);

                            if(pokemonErrors.length > 0){
                                errors.push(pokemon.speciesId + " is not a valid entry");
                                console.error(pokemonErrors);
                            }
                        });
                    } else{
                        errors.push("Pokemon is not a valid array");
                    }
                    break;

                case "all_moves":                   
                    if(value?.forEach){
                        value.forEach(move => {
                            let moveErrors = GMEditorUtils.ValidateMoveEntry(move);

                            if(moveErrors.length > 0){
                                errors.push(move.moveId+ " is not a valid entry");
                                console.error(moveErrors);
                            }
                        });
                    } else{
                        errors.push("Moves is not a valid array");
                    }
                    break;
            }
        }

        return errors;
    }

    // Validations - required, string min length, string max length, unique, number, number min, number max, integer, allowed values, invalid values, regex


    // Given a base list element and data items, output HTML for an editable list

    static DisplayEditableList(dataType, listItems){
        let $el = $(".editable-list[data='"+dataType+"']");
        $el.html("");

        if(! listItems || listItems?.length == 0){
            return;
        }

        switch(dataType){
            case "fastMoves":
            case "chargedMoves":
            case "legacyMoves":
            case "eliteMoves":
                if(typeof listItems !== "undefined"){
                    listItems.forEach(id => {
                        let move = GameMaster.getInstance().getMoveDataById(id);

                        if(move){
                            let $item = $("<div></div>");
                            $item.html(move.name);
                            $item.addClass(move.type);
                            $item.attr("data", id);
                            $item.append("<span></span>");

                            $el.append($item);
                        }
                    });
                }
                break;

            case "learnset":
                if(typeof listItems !== "undefined"){
                    listItems.forEach(pokemon => {
                        let $item = $("<div></div>");
                        $item.html(pokemon.speciesName);
                        $item.addClass(pokemon.types[0]);
                        $item.attr("data", pokemon.speciesId);
                        $item.append("<span></span>");

                        $el.append($item);
                    });
                }
                break;

            default:
                listItems.forEach(id => {
                    let $item = $("<div></div>");
                    $item.html(id);
                    $item.attr("data", id);
                    $item.append("<span></span>");

                    $el.append($item);
                });
                break;
        }
    }

}

// Load validations
let GMEditorValidations = {};

$.ajax({
    dataType: "json",
    url: webRoot+"data/gamemaster/validations.json?v="+siteVersion,
    mimeType: "application/json",
    error: function(request, error) {
        console.log("Request: " + JSON.stringify(request));
        console.log(error);
    },
    success: function( data ) {

        if(data && data.length > 0){
            data.forEach(obj => {
                let objectType = obj.objectType;

                GMEditorValidations[objectType] = obj.validations;
            });
        }

        console.log("gamemaster validations loaded");
        console.log(GMEditorValidations);
    }
});