inizializza:
gm = GameMaster.getInstance()
battle = new Battle()

al cambio di lega (es in RankingInterface.js), viene chiamato questo:
gm.loadRankingData(self, category, league, cup);

dove self è un oggetto che deve implementare displayRankingData che viene chiamato con la lista di rankings presi dalla cartella data/rankings/... ognuno ha uno speciesId che può essere usato per create un Pokemon():
new Pokemon(gm['rankings']['alloverall500'][0]['speciesId'], 0, battle)

per contare le mosse veloci per caricata usare questo:
var moveCounts = Pokemon.calculateMoveCounts(fastMove, chargedMove);
ritorna array di 4 numeri uno per il numero di veolci per ogni caricata (prima, seconda, terza, quarta)
