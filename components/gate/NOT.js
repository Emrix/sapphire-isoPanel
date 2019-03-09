let debugMode = false;

function evaluate(inputs) {
    if (debugMode) { console.log("Inputs\n" + JSON.stringify(inputs)); }
    let evaluatedOutputs = { "X": 0 };

    if (inputs["A"] === -1) {
        evaluatedOutputs["X"] = -1;
    } else {
        evaluatedOutputs["X"] = Math.round(inputs["A"]) > .5 ? 0 : 1;
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
            console.log("not gate Debug Mode Activated!");
        } else {
            debugMode = false;
        }
    },
}