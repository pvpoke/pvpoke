// Dependency-free helpers for typo-tolerant Pokemon name search.

var FuzzySearch = new function(){
	var self = this;

	this.normalize = function(value){
		if(value === undefined || value === null){
			return "";
		}

		value = String(value).toLowerCase().trim();

		if(value.normalize){
			value = value.normalize("NFD");
		}

		value = value.replace(/[\u0300-\u036f]/g, "");
		value = value.replace(/['’`._\-()]/g, " ");
		value = value.replace(/[^\w\s]/g, " ");
		value = value.replace(/\s+/g, " ");

		return value.trim();
	}

	this.getPokemonNameSearchText = function(pokemon){
		var signature = getPokemonSearchSignature(pokemon);

		if(pokemon._search && pokemon._search.signature == signature){
			return pokemon._search;
		}

		var name = self.normalize(pokemon.speciesName || pokemon.displayName || "");
		var nicknames = [];
		var compactNicknames = [];

		if(pokemon.nicknames){
			for(var i = 0; i < pokemon.nicknames.length; i++){
				var nickname = self.normalize(pokemon.nicknames[i]);

				if(nickname != ""){
					nicknames.push(nickname);
					compactNicknames.push(getCompactText(nickname));
				}
			}
		}

		var searchCache = {
			signature: signature,
			name: name,
			compactName: getCompactText(name),
			tokens: name == "" ? [] : name.split(" "),
			nicknames: nicknames,
			compactNicknames: compactNicknames
		};

		Object.defineProperty(pokemon, "_search", {
			value: searchCache,
			writable: true,
			configurable: true
		});

		return pokemon._search;
	}

	// Typo-tolerant plus prefix-aware matching: exact, compact, prefix, token prefix, nickname, and edit-distance variants.
	this.getPokemonNameMatch = function(param, pokemon){
		var query = self.normalize(param);

		if(query == ""){
			return createMatch(false, Number.MAX_VALUE, null);
		}

		var compactQuery = getCompactText(query);
		var searchText = self.getPokemonNameSearchText(pokemon);

		if(query == searchText.name || compactQuery == searchText.compactName){
			return createMatch(true, 0, "exact");
		}

		for(var i = 0; i < searchText.nicknames.length; i++){
			if(query == searchText.nicknames[i] || compactQuery == searchText.compactNicknames[i]){
				return createMatch(true, 0, "nickname");
			}
		}

		if(searchText.name.startsWith(query) || searchText.compactName.startsWith(compactQuery)){
			return createMatch(true, 1, "prefix");
		}

		for(var i = 0; i < searchText.tokens.length; i++){
			if(searchText.tokens[i].startsWith(query)){
				return createMatch(true, 2, "token-prefix");
			}
		}

		for(var i = 0; i < searchText.nicknames.length; i++){
			if(searchText.nicknames[i].startsWith(query) || searchText.compactNicknames[i].startsWith(compactQuery)){
				return createMatch(true, 3, "nickname");
			}
		}

		var maxDistance = getMaxDistance(compactQuery.length);

		if(maxDistance == 0){
			return createMatch(false, Number.MAX_VALUE, null);
		}

		var seen = {};
		var candidates = [];

		function addCandidate(str){
			if(str && str != "" && !seen[str]){
				seen[str] = true;
				candidates.push(str);
			}
		}

		addCandidate(searchText.name);
		addCandidate(searchText.compactName);
		for(var i = 0; i < searchText.tokens.length; i++){
			addCandidate(searchText.tokens[i]);
		}
		for(var i = 0; i < searchText.nicknames.length; i++){
			addCandidate(searchText.nicknames[i]);
			addCandidate(searchText.compactNicknames[i]);
		}

		var bestDistance = maxDistance + 1;

		for(var i = 0; i < candidates.length; i++){
			var candidate = candidates[i];

			if(candidate == ""){
				continue;
			}

			var candidateQuery = candidate.indexOf(" ") > -1 ? query : compactQuery;
			var distance = getEditDistance(candidateQuery, candidate, maxDistance);

			if(distance <= maxDistance && passesFuzzyGuard(compactQuery, candidate, distance)){
				if(distance < bestDistance){
					bestDistance = distance;
				}
			}
		}

		if(bestDistance <= maxDistance){
			return createMatch(true, 10 + bestDistance, "fuzzy");
		}

		return createMatch(false, Number.MAX_VALUE, null);
	}

	function getEditDistance(a, b, maxDistance){
		if(a == b){
			return 0;
		}

		if(maxDistance === undefined){
			maxDistance = Math.max(a.length, b.length);
		}

		if(Math.abs(a.length - b.length) > maxDistance){
			return maxDistance + 1;
		}

		if(a.length == 0){
			return b.length;
		}

		if(b.length == 0){
			return a.length;
		}

		var previous = [];
		var current = [];

		for(var i = 0; i <= b.length; i++){
			previous[i] = i;
		}

		for(var i = 1; i <= a.length; i++){
			current[0] = i;
			var rowMin = current[0];

			for(var j = 1; j <= b.length; j++){
				var cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;

				current[j] = Math.min(
					previous[j] + 1,
					current[j - 1] + 1,
					previous[j - 1] + cost
				);

				if(current[j] < rowMin){
					rowMin = current[j];
				}
			}

			if(rowMin > maxDistance){
				return maxDistance + 1;
			}

			var temp = previous;
			previous = current;
			current = temp;
		}

		return previous[b.length];
	}

	function getCompactText(value){
		return self.normalize(value).replace(/\s/g, "");
	}

	function getPokemonSearchSignature(pokemon){
		var nicknames = pokemon.nicknames ? pokemon.nicknames.join("|") : "";
		return (pokemon.speciesName || pokemon.displayName || "") + "|" + nicknames;
	}

	function getMaxDistance(length){
		if(length < 3){
			return 0;
		}

		if(length == 3){
			return 1;
		}

		if(length <= 10){
			return 2;
		}

		return 3;
	}

	function passesFuzzyGuard(query, candidate, distance){
		if(query.charAt(0) == candidate.charAt(0)){
			return true;
		}

		return query.length >= 6 && distance == 1;
	}

	function createMatch(matched, score, type){
		return {
			matched: matched,
			score: score,
			type: type
		};
	}
};
