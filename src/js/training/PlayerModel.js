//import * as tf from '@tensorflow/tfjs';

function PlayerModel(b, hiddenLayerSizesOrModel, numStates, numActions, batchSize) {
    var numStates = numStates;
    var numActions = numActions;
    var batchSize = batchSize;

    const optimizer = 'sgd';
    const loss = 'meanSquaredError';

    var network = null;

    var Q ={};
    var alpha = 0.06;
    var eps = 1.0;
    var gamma = 0.1;

    var memory = new PlayerMemory();

    this.defineModel = async function(hiddenLayerSizes) {

        // check if previous model exists on server
        // there must be a cleaner way to do this
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', "http://localhost"+webRoot+"data/training/ainetwork/model.json", false);
        xhr.send();
        console.log(xhr.status);

        if (xhr.status == 200) {
            network = await tf.loadLayersModel("http://localhost"+webRoot+"data/training/ainetwork/model.json");
            console.log(typeof network);
        } else {
            if (!Array.isArray(hiddenLayerSizes)){
                hiddenLayerSizes = [hiddenLayerSizes];
            }

            network = tf.sequential();
            hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
                network.add(tf.layers.dense({
                    units: hiddenLayerSize,
                    activation: 'relu',
                    inputShape: ((i == 0) ? [numStates] : undefined)
                }));
            });
            network.add(tf.layers.dense({units: numActions, activation: 'linear'}));
        }

        network.summary();
        network.compile({optimizer: optimizer, loss: loss, metrics: ['acc']});
    }

    // format state dictionary into array appropriate for network model
    this.formatState = function(state){
        // how to enforce order?
        return Object.values(state);
    }

    // format policy dictionary into array appropriate for network model
    this.formatPolicy = function(policy){
        return [policy['fast'], policy['charged1'], policy['charged2'],policy['switch1'], policy['switch2']];
    }

    this.predict = function(state) {
        // format state
        let stateArr = tf.stack([this.formatState(state)]);
        let predictionsArr = tf.tidy(() => network.predict(stateArr)).arraySync();
        return predictionsArr[0];
    }

    this.train = async function(xBatch, yBatch) {
        let formattedXBatch = [];
        let formattedYBatch = [];
        // format xBatch
        for (const state of xBatch) {
            formattedXBatch.push(this.formatState(state));
        }

        // format yBatch
        for (const policy of yBatch) {
            formattedYBatch.push(this.formatPolicy(policy));
        }

        // can make a metrics function here to refactor later
        console.log("x");
        console.log(formattedXBatch);
        console.log("YTrue");
        console.log(formattedYBatch);

        console.log("Fitting network to new data");
        const h = await network.fit(tf.stack(formattedXBatch), tf.stack(formattedYBatch));
        console.log("Network accuracy: " + h.history.acc);
        console.log("Network loss: " + h.history.loss);
    }

    // action mapping:
    // 0: fast move
    // 1: charged move 1
    // 2: charged move 2
    // 3: switch pokemon 1
    // 4: switch pokemon 2
    this.chooseAction = function(state, reward) {
        let action = this.bestAction(state);
        // randomness inserted here
        if (Math.random() < eps) {
            // range -2 to 2
            let actionNum = Math.floor(Math.random() * numActions);
            switch (actionNum) {
                case 0: 
                    action = 'fast';
                    break;
                case 1: 
                    action = 'charged1';
                    break;
                case 2: 
                    action = 'charged2';
                    break;
                case 3:
                    action = 'switch1';
                    break;
                case 4:
                    action = 'switch2';
                    break;
            }
            console.log("Randomly choosing action " + action);
        }  

        // TODO: use battle state to check if charged or switch choices are invalid, if so choose fast instead
        memory.addEvent(state, reward, action);

        return action;
    }

    // returns the expected rewards for each action given a state and Q-function
    // initializes table values if not previously existed
    this.policy = function(state) {
        stateKey = this.formatState(state);
        if (!(stateKey in Q)) {
            Qvalues = this.predict(state);
            Q[stateKey] = {
                'fast': Qvalues[0],
                'charged1': Qvalues[1],
                'charged2': Qvalues[2],
                'switch1': Qvalues[3],
                'switch2': Qvalues[4]
            };
        }
        return Q[stateKey];
    };

    // returns the expected reward for a specific state-action and Q-function
    this.eReward = function(state, action) {
        return this.policy(state)[action];
    }

    this.bestAction = function(state) {
        Qvalues = this.policy(state);

        // default to fast move, it makes sense i guess
        let bestReward = Qvalues['fast'];
        let best = 'fast';
        for (const action of Object.keys(Qvalues)){
            if (Qvalues[action] > bestReward) {
                best = action;
                bestReward = Qvalues[action];
            }
        }
        return best;
    }

    this.addEvent = function(state, reward, action) {
        memory.addEvent(state, reward ,action);
    }

    this.updateQ = function(state, action, reward, newState) {
        let eFutureReward = this.policy(newState)[this.bestAction(newState)];
        // lines are separated to ensure that Q Table for current state is initialized
        let eRewardChange = reward + gamma*eFutureReward - this.eReward(state, action);
        Q[this.formatState(state)][action] += alpha*(eRewardChange);
    }

    this.update = async function(){
        modelXBatch = [];
        modelYBatch = [];
        let prevEvent = null;
        let event = memory.deQueue();
        while(memory.getLength() > 0) {
            // Update Q Tables
            prevEvent = event;
            event = memory.deQueue();
            this.updateQ(prevEvent['state'], prevEvent['action'], event['reward'], event['state']);

            // Build training x set for network model
            modelXBatch.push(prevEvent['state']);
        }

        // build training y set in separate loop to ensure Q tables are fully updated
        for (const state of modelXBatch) {
            modelYBatch.push(this.policy(state));
        }

        // Run network training
        this.train(modelXBatch, modelYBatch);

        // save updated results to server

        console.log("saving and loading to localhost"+webRoot+"data/network.php");
        const saveResult = await network.save("http://localhost"+webRoot+"data/network.php");
        console.log(saveResult);

    }
}