let debugMode = false;

function evaluate(inputs) {
    if (debugMode) { console.log("Inputs\n" + JSON.stringify(inputs)); }
    let evaluatedOutputs = { "X": 0 };
    evaluatedOutputs["X"] = inputs["A"];
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
            console.log("output emitter Debug Mode Activated!");
        } else {
            debugMode = false;
        }
    },
}