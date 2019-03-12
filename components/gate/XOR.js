let debugMode = false;

function evaluate(inputs) {
    if (debugMode) { console.log("Inputs\n" + JSON.stringify(inputs)); }
    let evaluatedOutputs = { "X": 0 };

    var result = 0;
    var hasAnX = false;
    for (let element in inputs) {
        if (inputs[element] === -1) {
            hasAnX = true;
        }
        if (inputs[element] > .5) {
            result++;
        }
    };
    if (hasAnX) {
        evaluatedOutputs["X"] = -1;
    } else {
        evaluatedOutputs["X"] = result % 2;
    }

    if (debugMode) { console.log("Evaluated Outputs\n" + JSON.stringify(evaluatedOutputs)); }
    return evaluatedOutputs;
}

module.exports = {
    evaluate,

    get debugMode() {
        return debugMode;
    },

    set debugMode(tf) {
        if (tf) {
            debugMode = true;
            console.log("xor gate Debug Mode Activated!");
        } else {
            debugMode = false;
        }
    },
}