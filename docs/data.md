# gamemaster.json

`gamemaster.json` contains most of the data for PvPoke to function. It is generated from `compile.php`, which combines the following files:
 - `gamemaster/base.json`
 - `gamemaster/pokemon.json`
 - `gamemaster/moves.json`
 - `gamemaster/formats.json`

It also contains the json data over each cup found in `gamemaster/cups`.

## base.json

 - This file contains general settings for the website.

## pokemon.json

 - Each entry represents a specific Pokémon.
 - There can be multiple forms of a Pokémon that share the same dex number, such as Giratina.
 - The values are all pretty straightforward.
 - Tags can be used for filtering custom rankings / searching
 - `speciesId` is the internal name.
 - `speciesName` is the display name.
 - Moves that require an elite tm are in the `eliteMoves` list, no matter if they are fast or charged.
 - `released` is if a Pokémon should be included in the rankings, as there are unreleased Pokémon that we know the stats for.
 - `level25CP` is used to determine if the Pokémon has access to the charged move `RETURN`, as purifying sets the level to 25.
   - The Pokémon must also have the tag `shadoweligible` for this.
 - `searchPriority` determines where a Pokémon is placed when searching. Higher means it will show up first.

## moves.json

 - Each entry corresponds to either a fast move or a charged move.
 - `moveId` is the internal name of the move. It does not include the `_FAST` that the real gamemaster uses.
 - `name` is the value displayed to users for the move.
 - `type` is the type of the move (water / grass / fire / etc)
 - `power` is how much damage the move does per use.
 - `energy` is how much the move costs to use. This is 0 for fast moves.
 - `energyGain` is how much energy per use a fast move generates. It is 0 for charged moves.
 - `cooldown` is the number of milliseconds a move takes. All charged moves are 500 (1 turn = 0.5 seconds).
 - `archetype` is a category for the move, like "Spam/Bait" or "Fast Charge"
 - `abbreviation` is an option override for how to abbreviate the move. The default is to concatenate the first letter of each word in `moveId` split by `_`.


## formats.json

 - Each entry corresponds to a specific meta specified in the `gamemaster/cups` directory specified by the `cup` field.
 - There is also a custom entry for creating your own metas.
 - The `title` field is the value displayed to users for the meta.
 - The `cp` field is the max CP for the meta.
 - The `meta` field is the value used for the name of a custom group for the meta (found in the groups directory).
 - The `showCup` field is a boolean to display the format in the Multi Battle cup select list.
 - The `showFormat` field is a boolean to display the format in the rankings select list, the development ranker select list, and team builder.
 - The `showMeta` field is a boolean to display the format in the Multi Battle quick select list.
 - The `hideRankings` field is a boolean to hide the format from the rankings select list. This overrides `showFormat`.

## cups (directory)

 - Each json file corresponds to the `cup` field for an entry in `formats.json`.
 - The `name` field is the value used interally for referring to the meta.
 - The `title` field is the value displayed to users for the meta.
 - The file also includes details for creating the metas for cups.
   - partySize
   - levelCap
   - presetOnly
   - filters for including / excluding specific Pokémon / types / tags / etc

# groups (directory)

 - The groups directory contains files with predifined groups of the most common Pokémon for a specific meta.
 - These groups can be used in places like the quick select list for Matrix Battles.
 - Each file corresponds to a `meta` field of an entry in `formats.json`
 - Each file contains a list of Objects with values for `speciesId` and `fastMove`, and a list of `chargedMoves`.