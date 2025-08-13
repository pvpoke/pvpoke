class GMEditorUtils{
    // This method returns a Pokemon or Move ID given a string
    static StringToID(string, fieldName){

        let id = string.toLowerCase().replace(/[^a-zA-Z]/g, "_");

        switch(fieldName){

        }

        return id;
    }

    // Validate a full Pokemon entry
    static ValidatePokemonEntry(entry){
        //let properties = ["speciesId", "speciesName", "aliasId", "dex", "nicknames", "baseStats", "types", "fastMoves", "chargedMoves", "eliteMoves", "legacyMoves", "defaultIVs", "buddyDistance", "thirdMoveCost", "released", "searchPriority", "tags"];

        let fieldErrors = [];
        let validations = GMEditorValidations.pokemon;

        validations.forEach(validation => {
            let propertyErrors = GMEditorUtils.ValidateField("pokemon", validation.property, entry[validation.property]);

            if(propertyErrors.length > 0){
                fieldErrors.push({
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

        for(let validation of validations){
            switch(validation.type){
                case "required":
                    if(! value || value?.length == 0 || value == ""){
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

                case "invalid_values":
                    if(validation?.value?.includes(value)){
                        errors.push("Field is an invalid value.")
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
                    if(! Pokemon.getAllTypes().includes(value)){
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
            }
        }

        return errors;
    }

    // Validations - required, string min length, string max length, unique, number, number min, number max, integer, allowed values, invalid values, regex
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