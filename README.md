# Deep Q-Learning PVP AI

## Basic Workflow

1. User sets up a battle managed through TrainingSetupInterface and MatchHandler, through which a new Battle, Player, PlayerAI, and PlayerModel are created. ** previous Q-function and perceptron model are loaded from a json file **
2. Battle begins, updates the battle state in step() at 0.5 second intervals
3. At each step(), PlayerAI asks PlayerModel to push previous state, action, and reward to PlayerMemory queue, and call the perceptron network to predict an action that will yield the largest reward (approximating the Q-function). Rewards are awarded if an opponent pokemon faints or if the player wins the game. Negative reward for a player pokemon fainting or losing/tying the game. PlayerAI then forwards the given action to Battle action queue.
4. When battle ends, either by a player running out of pokemon or time limit (240s) reached, Battle pushes final state-action-reward to Memory queue.
5. Battle calls PlayerModel to update Q-function with data in PlayerMemory queue and then train perceptron network on updated data.
6. ** Q-function and perceptron model are saved to json file **

## Todo

PlayerAI.js : finish writing battle state, write decideAction() to get battle state, get prediction from PlayerModel, and then format action for push to actionqueue (eventually, replace generateTeam, generateRoster, decideSwitch, and decideShield)

PlayerModel.js : write formatState to take state dictionary and return array for input to network

Battle.js : adjust time intervals to make emulate() run faster. or add to simulate() to allow full 3v3 battles.
MatchHandler.js : incorporate user choice between AI and manual. allow opponent to use PlayerAI.
