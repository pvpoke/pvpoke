import * as tf from '@tensorflow/tfjs';

function PlayerModel(b, hiddenLayerSizesOrModel, numStates, numActions, batchSize) {
    var numStates = numStates;
    var numActions = numActions;
    var batchSize = batchSize;

    const optimizer = 'adam';
    const loss = 'meanSquaredError';

    var network = null;

    if (hiddenLayerSizesOrModel instanceof tf.LayersModel) {
        network = hiddenLayerSizesOrModel;
        network.summary();
        network.compile({optimizer: optimizer, loss: loss});
    } else {
        self.defineModel(hiddenLayerSizesOrModel);
    }

    var Q ={};
    var alpha = 0.06;
    var eps = 0.1;
    var gamma = 0.1;

    var memory = new PlayerMemory();

    this.defineModel = function(hiddenLayerSizes) {
        if (!Array.isArray(hiddenLayerSizes)){
            hiddenLayerSizes = [hiddenLayerSizes];
        }

        network = tf.sequential();
        hiddenLayerSizes.forEach((hiddenLayerSize, i) => {
            network.add(tf.layers.dense({
                units: hiddenLayerSize,
                activation: 'relu',
                inputShape: i == 0 ? [numStates] : undefined
            }));
        });
        network.add(tf.layers.dense({units: numActions}));

        network.summary();
        network.compile({optimizer: optimizer, loss: loss});
    }

    // format state dictionary into array appropriate for network model
    this.formatState = function(state){

    }

    // format policy dictionary into array appropriate for network model
    this.formatPolicy = function(policy){
        return [policy['switch2'], policy['switch1'], policy['fast'], policy['charged1'], policy['charged2']];
    }

    this.predict = function(state) {
        // format state
        let formattedState = this.formatState(state);

        return tf.tidy(() => network.predict(formattedState));
    }

    // async?
    this.train = function(xBatch, yBatch) {
        // await?
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

        network.fit(formattedXBatch, formattedYBatch);
    }

    // action mapping:
    // -2: switch pokemon 2
    // -1: switch pokemon 1
    // 0: fast move
    // 1: charged move 1
    // 2: charged move 2
    this.chooseAction = function(state, reward, eps) {
        let actionNum = 0;
        // randomness inserted here
        if (Math.random() < eps) {
            // range -2 to 2
            actionNum = Math.floor(Math.random() * numActions) - 2;
        } else {
            return tf.tidy(() => {
                const logits = network.predict(state);
                const sigmoid = tf.sigmoid(logits);
                const probs = tf.div(sigmoid, tf.sum(sigmoid));
                actionNum = tf.multinomial(probs, 1).dataSync()[0] - 2;
            });
        }
        // shouldn't need breaks because returns
        let action = 'fast';
        switch (actionNum) {
            case -2: action = 'switch2'
            case -1: action = 'switch1'
            case 0:  action = 'fast'
            case 1:  action = 'charged1'
            case 2:  action = 'charged2'
        }
        memory.addEvent(state, reward, action)

        return action;
    }

    // returns the expected rewards for each action given a state and Q-function
    // initializes table values if not previously existed
    this.policy = function(state) {
        if (!Q.has(state)) {
            Q[state] = {'fast': 0, 'charged1': 0, 'charged2': 0, 'switch1': 0, 'switch2': 0};
        }
        return Q[state];
    };

    // returns the expected reward for a specific state-action and Q-function
    this.eReward = function(state, action) {
        return this.policy(state)[action];
    }

    this.bestAction = function(state) {
        QTable = this.policy(state);

        // default to fast move, it makes sense i guess
        let bestReward = QTable['fast'];
        let best = 'fast';
        for (const action of QTable.keys()){
            if (QTable[action] > bestReward) {
                best = action;
                bestReward = QTable[action];
            }
        }
        return best;
    }

    this.updateQ = function(state, action, reward, newState) {
        let eFutureReward = this.policy(newState)[this.bestAction(newState)]
        // lines are separated to ensure that Q Table for current state is initialized
        let eRewardChange = reward + gamma*eFutureReward - this.eReward(state)[action]
        Q[state][action] += alpha*(eRewardChange);
    }

    this.update = function(){
        modelXBatch = [];
        modelYBatch = [];
        let prevEvent = null;
        let event = null;
        while(memory.length() > 0) {
            // Update Q Tables
            prevEvent = event;
            event = memory.deQueue();
            this.updateQ(prevEvent['state'], prevEvent['action'], event['reward'], event['state'])

            // Build training x set for network model
            modelXBatch.push(prevEvent['state']);
        }
        // build training y set in separate loop to ensure Q tables are fully updated
        for (const state of modelXBatch) {
            modelYBatch.push(this.policy(state));
        }

        // Run network training
        this.train(modelXBatch, modelYBatch);
    }
}