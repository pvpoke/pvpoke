const process = require('node:process');
const pokemonImport = require('../pokemon/Pokemon.js');


const Pokemon = pokemonImport.Pokemon;

const { GameMaster } = require('../GameMaster.js');

// Prevent automatic closing when executing .exe files
process.stdin.resume()

!(async() => {
  let argv = process.argv.slice(2);
  if(! argv?.length || argv?.length < 2){
    console.log("Insufficient arguments: cup name and CP required");
    process.exit();
  }

  let cupName = argv[0];
  let cp = parseInt(argv[1]);

  let validCPs = [500, 1500, 2500, 10000];

  if(! validCPs.includes(cp)){
    console.log("Invalid CP. Must use 500, 1500, 2500, or 10000");
    process.exit();
  }

  console.log(argv);
  console.log(Pokemon.getAllTypes(true));

  let poke = new Pokemon("azumarill", 0, {});
})()
