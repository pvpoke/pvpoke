class GMEditorUtils{
    // This method returns a Pokemon or Move ID given a string
    static StringToID(string, capitalize = false){
        let id = string.toLowerCase().replace(/[^a-zA-Z]/g, "_");
        if(capitalize){
            id = string.toUpperCase();
        }
        return id;
    }


    // Validate a field given its value and validations
    static ValidateField(fieldName, value){
        let errors = [];
        let validations = GMEditorValidations.find(v => v.field == fieldName)?.validations;

        if(! validations || ! validations?.length){
            validations = [];
        }

        for(let validation of validations){
            switch(validation.type){
                case "required":
                    if(! value || value?.length == 0){
                        errors.push("Field is required.")
                        return errors;
                    }
                    break;

                case "string_min_length":
                    if(value?.length < validation.value){
                        errors.push("Field is too short (min " + validation.value + ").")
                    }
                    break;

                case "string_max_length":
                    if(value?.length > validation.value){
                        errors.push("Field is too long (max " + validation.value + ").")
                    }
                    break;

                case "invalid_values":
                    if(validation?.value?.includes(value)){
                        errors.push("Field is an invalid value.")
                    }
                    break;
            }
        }

        return errors;
    }

    // Validations - required, string min length, string max length, unique, number, number min, number max, integer, allowed values, invalid values
}

// Load validations
let GMEditorValidations = [];

$.ajax({
    dataType: "json",
    url: webRoot+"data/gamemaster/validations.json?v="+siteVersion,
    mimeType: "application/json",
    error: function(request, error) {
        console.log("Request: " + JSON.stringify(request));
        console.log(error);
    },
    success: function( data ) {
        GMEditorValidations = data;

        console.log("gamemaster validations loaded");
    }
});