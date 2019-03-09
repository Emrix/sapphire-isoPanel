let debugMode = false;

let simulation = { "scheduled_components": [], "rats_nest": {} }

const CHANGE_COUNT_LIMIT = 10;
const CYCLE_LIMIT = 100;
let total_cycles = 0;

function run(circuit, dataIn) {
    if (debugMode) { console.log("Inputs\n" + JSON.stringify(dataIn)); }
    let dataOut = [];

    //Compile the logic circuit
    for (key in circuit.rats_nest) {
        simulation.rats_nest[circuit.rats_nest[key]] = { "value": 0, "change_count": 0 };
    }
    //Put all of the driver UUIDs in simulation.scheduled_components
    for (key in circuit.components) {
        if (circuit.components[key].type == "driver") {
            simulation.scheduled_components.unshift(key);
        } else {
            simulation.scheduled_components.push(key);
        }
    }

    while (simulation.scheduled_components[0] && total_cycles < CYCLE_LIMIT) {

        let componentID = JSON.parse(JSON.stringify(simulation.scheduled_components[0]));
        let inputs = JSON.parse(JSON.stringify(circuit.components[componentID].inputs));
        let outputs = JSON.parse(JSON.stringify(circuit.components[componentID].outputs));
        let type = JSON.parse(JSON.stringify(circuit.components[componentID].type));
        let descriptor = JSON.parse(JSON.stringify(circuit.components[componentID].descriptor));
        let componentCode = require('./components/' + type + "/" + descriptor + ".js");

        if (type != "driver") {
            for (let key in inputs) {
                if (simulation.rats_nest[inputs[key]].change_count < CHANGE_COUNT_LIMIT) {
                    inputs[key] = verifyInput(simulation.rats_nest[inputs[key]].value);
                } else {
                    inputs[key] = -1;
                }
            }
        } else {
            for (let key in inputs) {
                inputs[key] = dataIn[inputs[key]];
            }
        }

        let evaluatedOutput = componentCode.evaluate(inputs);

        if (type != "emitter") {
            for (let key in outputs) {
                if (simulation.rats_nest[outputs[key]].value != verifyInput(evaluatedOutput[key])) {
                    simulation.rats_nest[outputs[key]].value = verifyInput(evaluatedOutput[key]);
                    wireChanged(outputs[key]);
                    simulation.rats_nest[outputs[key]].change_count++;
                }
            }
        } else {
            //Grab Emitter inputs, and the values of those inputs from the rat's nest
            for (let key in outputs) {
                dataOut[outputs[key]] = evaluatedOutput[key];
            }
        }

        simulation.scheduled_components.shift();
        //Find all components that are connected to that wire, and schedule them.
        total_cycles++;
    }

    if (total_cycles >= CYCLE_LIMIT) {
        throw ("Exceeded Simulation Limit");
    }


    function wireChanged(uuid) {
        if (!simulation.rats_nest[uuid]) {
            return -1; //UUID doesn't exist
        }
        if (debugMode) { console.log("Wire Changed: " + uuid); }
        for (let componentKey in circuit.components) {
            for (let inputKey in circuit.components[componentKey].inputs) {
                if (circuit.components[componentKey].inputs[inputKey] == uuid) {
                    if (simulation.scheduled_components.indexOf(componentKey) != -1) {
                        simulation.scheduled_components.splice(simulation.scheduled_components.indexOf(componentKey), 1); //If a component is already scheduled, it gets removed
                    }
                    simulation.scheduled_components.push(componentKey); //Schedule the component (on the back of the queue)
                }
            }
        }
        return 0;
    }


    function verifyInput(input) {
        //Loop through each item in the array
        if (typeof(input) != "number") {
            //Verify that it is a number,
            //else we initialize to our special number.
            input = -1;
        } else if (input === -1) {
            //-1 is a special level
            //So we don't do much here...
        } else {
            //verify that it is within bounds
            input = Math.max(input, 0);
            input = Math.min(input, 1);
        }
        return input;
    };

    if (debugMode) { console.log("Evaluated Outputs\n" + JSON.stringify(dataOut)); }
    return dataOut;
}

module.exports = {
    run,

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