let debugMode = false;

function evaluate(inputs) {
    if (debugMode) { console.log("Inputs\n" + JSON.stringify(inputs)); }
    let evaluatedOutputs = { "X": 0 };

    var result = 1;
    for (let element in inputs) {
        if (inputs[element] >= 0 && inputs[element] < .5) {
            result = 0;
            break;
        }
        if (inputs[element] === -1 && result != 0) {
            result = -1;
            break;
        }
    };
    evaluatedOutputs["X"] = result;

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
            console.log("and gate Debug Mode Activated!");
        } else {
            debugMode = false;
        }
    },
}