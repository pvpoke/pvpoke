import * as tf from '@tensorflow/tfjs';

function PlayerModel(hiddenLayerSizesOrModel, numStates, numActions, batchSize) {
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

    this.predict = function(states) {
        return tf.tidy(() => network.predict(states));
    }

    // async?
    this.train = function(xBatch, yBatch) {
        // await?
        network.fit(xBatch, yBatch);
    }

    this.chooseAction = function(state, eps) {
        if (Math.random() < eps) {
            // range -2 to 2
            return Math.floor(Math.random() * numActions) - 2;
        } else {
            return tf.tidy(() => {
                const logits = network.predict(states);
                const sigmoid = tf.sigmoid(logits);
                const probs = tf.div(sigmoid, tf.sum(sigmoid));
                return tf.multinomial(probs, 1).dataSync()[0] - 1;
            });
        }
    }
}