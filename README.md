# Deep Q-Learning PVP AI

## Basic Workflow

1. User sets up a battle managed through TrainingSetupInterface and MatchHandler, through which a new Battle, Player, PlayerAI, and PlayerModel are created. ** previous Q-function and perceptron model are loaded from a json file **
2. Battle begins, updates the battle state in step() at 0.5 second intervals
3. At each step(), PlayerAI asks PlayerModel to push previous state, action, and reward to PlayerMemory queue, and call the perceptron network to predict an action that will yield the largest reward (approximating the Q-function). Rewards are awarded if an opponent pokemon faints or if the player wins the game. Negative reward for a player pokemon fainting or losing/tying the game. PlayerAI then forwards the given action to Battle action queue.
4. When battle ends, either by a player running out of pokemon or time limit (240s) reached, Battle pushes final state-action-reward to Memory queue.
5. Battle calls PlayerModel to update Q-function with data in PlayerMemory queue and then train perceptron network on updated data.
6. ** Q-function and perceptron model are saved to json file **

## Todo

PlayerAI.js : refine battle state(opponent quantities), check that actions are being queued correctly, filter action decisions to prevent switches to fainted pokemon, include move effectiveness for battle state, opponent guessing system 
(eventually, replace generateTeam, generateRoster, decideSwitch, and decideShield)

PlayerModel.js : allow for saving network and Q table to server as files, enforce order for game state

Battle.js : adjust time intervals to make emulate() run faster. or add to simulate() to allow full 3v3 battles.

MatchHandler.js : incorporate user choice between AI and manual. allow opponent to use PlayerAI.

## Notes

duplicate data with lead charged moves (x2), party pokemon(x2), party pokemon charged moves(x4), opponent lead charged moves(x2), opponent party pokemon(x2), opponent party pokemon charged moves(x4) swapped for x2^8 (x256) more data points
each game has up to 480 (122880 with duplicates) state-action-reward data points

Run TrainingAI in parallel with PlayerAI for educated guesses to start? E.g. for 0<eps<0.1 do a random action, for 0.1<eps<0.5 ask TrainingAI for an action, and reduce range as model becomes more trained.

Almost inclined to fix Battle-Player-TrainingAI interactions so TrainingAI is more self contained (chooseAction in particular).


What are the roles and responsibilities?:

MatchHandler.js : 

Battle.js : manage and update battle state at each turn, query actions from players, execute actions on action queue

Player.js : maintain a battling player state (num shields, pokemon team, switch cooldown)

TrainingAI.js/PlayerAI.js : choose a team, choose a battle action, choose shield, choose switch, guess opponent state (team,moves,stats)

Pokemon.js : maintain a battling pokemon state
