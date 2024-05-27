CREATE TABLE `training_pokemon` (
  `trainingPokemonId` bigint(20) NOT NULL AUTO_INCREMENT,
  `pokemonId` varchar(64) NOT NULL,
  `format` varchar(64) NOT NULL,
  `teamPosition` tinyint(4) NOT NULL,
  `playerType` tinyint(4) NOT NULL,
  `teamScore` smallint(6) NOT NULL,
  `individualScore` float NOT NULL,
  `shields` tinyint(4) NOT NULL,
  `postDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY(trainingPokemonId)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `training_team` (
  `trainingTeamId` bigint(20) NOT NULL AUTO_INCREMENT,
  `teamStr` varchar(255) NOT NULL,
  `format` varchar(64) NOT NULL,
  `playerType` tinyint(4) NOT NULL,
  `teamScore` smallint(6) NOT NULL,
  `postDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(trainingTeamId)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
