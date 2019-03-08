var fs = require('fs');

const configFile = "new_test";

fs.readFile((__dirname + '/circuits/' + configFile + ".json"), { encoding: 'utf-8' }, function(err, circuit) { //read file config.json
    if (err) {
        throw "Unable to validate\n" + err;
    } else {
        //Make sure it's in valid JSON
        circuit = JSON.parse(circuit);


        //Make sure each wire UUID is unique
        for (let key in circuit.rats_nest) {
            for (let anotherkey in circuit.rats_nest) {
                if (key === anotherkey) {
                    continue;
                }
                if (circuit.rats_nest[key] == circuit.rats_nest[anotherkey]) {
                    throw "Two wires have the same ID '" + circuit.rats_nest[key] + "' at " + key + " and " + anotherkey;
                }
            }
        }


        /*
        //Make sure each component UUID is unique
        //So, this doesn't actually work, because of how the JSON is formatted.
        //It'll pick up the first instance of that UUID always, and just go with it
        //So it'll never detect a duplicate
        for (let key in circuit.components) {
            let counter = 0;
            for (let anotherkey in circuit.components) {
                if (key === anotherkey) {
                    counter++;
                }
            }
            if (counter > 1) {
                throw "Two components have the same ID '" + circuit.components[key] + "'";
            }
        }
        */

        //Make sure circuit component inputs and outputs match their templates
        for (let key in circuit.components) {
            let type = circuit.components[key].type
            let descriptor = circuit.components[key].descriptor
            fs.readFile((__dirname + '/components/' + type + "/" + descriptor + ".json"), { encoding: 'utf-8' }, function(err, data) {
                if (err) {
                    throw "Unable to find" + '/components/' + type + "/" + descriptor + ".json" + "\n" + err;
                } else {
                    if (data.length < 40) {
                        throw "Invalid circuit component" + '/components/' + type + "/" + descriptor + ".json";
                    }
                    data = JSON.parse(data);
                    for (let templateConnector in data.inputs) {
                        let inputFound = false;
                        for (let circuitConnection in circuit.components[key].inputs) {
                            if (data.inputs[templateConnector] == circuitConnection) {
                                inputFound = true;
                            }
                        }
                        if (!inputFound) {
                            console.log("WARNING: Component " + key + " was missing input " + data.inputs[templateConnector]);
                            circuit.components[key].inputs[data.inputs[templateConnector]] = "";
                        }
                    }
                    for (let templateConnector in data.outputs) {
                        let outputFound = false;
                        for (let circuitConnection in circuit.components[key].outputs) {
                            if (data.outputs[templateConnector] == circuitConnection) {
                                outputFound = true;
                            }
                        }
                        if (!outputFound) {
                            console.log("WARNING: Component " + key + " was missing output " + data.outputs[templateConnector]);
                            circuit.components[key].outputs[data.outputs[templateConnector]] = "";
                        }
                    }
                }
            });
        }

        //Make sure all component Types and Descriptors actually exist and have code
        for (let key in circuit.components) {
            let type = circuit.components[key].type
            let descriptor = circuit.components[key].descriptor
            fs.readFile((__dirname + '/components/' + type + "/" + descriptor + ".js"), { encoding: 'utf-8' }, function(err, data) {
                if (err) {
                    throw "Unable to find" + '/components/' + type + "/" + descriptor + ".js" + "\n" + err;
                } else {
                    if (data.length < 40) {
                        throw "Invalid circuit component" + '/components/' + type + "/" + descriptor + ".js";
                    }
                    var testImportComponent = require('./components/' + type + "/" + descriptor + ".js");
                    testImportComponent.evaluate;
                }
            });
        }

        //Check to see if there is more than one driving output connected to a wire
        for (let wireKey in circuit.rats_nest) {
            let inputCount = 0;
            for (let componentKey in circuit.components) {
                for (let componentInput in circuit.components[componentKey].inputs) {
                    if (circuit.components[componentKey].inputs[componentInput] == circuit.rats_nest[wireKey]) {
                        inputCount++;
                    }
                }
            }
            if (inputCount > 1) {
                throw ("Wire " + circuit.rats_nest[wireKey] + " has multiple inputs");
            }
        }

        //Check to see if there are any wires not connected to either an input or an output
        for (let wireKey in circuit.rats_nest) {
            let inputCount = 0;
            let outputCount = 0;
            for (let componentKey in circuit.components) {
                for (let componentInput in circuit.components[componentKey].inputs) {
                    if (circuit.components[componentKey].inputs[componentInput] == circuit.rats_nest[wireKey]) {
                        inputCount++;
                    }
                }
                for (let componentOutput in circuit.components[componentKey].outputs) {
                    if (circuit.components[componentKey].outputs[componentOutput] == circuit.rats_nest[wireKey]) {
                        outputCount++;
                    }
                }
            }
            if (inputCount == 0) {
                console.log("WARNING: Wire " + circuit.rats_nest[wireKey] + " has no input connections.");
            }
            if (outputCount == 0) {
                console.log("WARNING: Wire " + circuit.rats_nest[wireKey] + " has no output connections.");
            }
        }

        //Check to see if there are any inputs / outputs that are not connected to a wire
        for (let componentKey in circuit.components) {
            for (let componentInput in circuit.components[componentKey].inputs) {
                if (circuit.components[componentKey].inputs[componentInput] == "") {
                    console.log("WARNING: Input " + componentInput + " on Component " + componentKey + " has no wire connections.");
                }
                if (circuit.components[componentKey].type != "driver") {
                    let matchesWireKey = false;
                    for (let wireKey in circuit.rats_nest) {
                        if (circuit.components[componentKey].inputs[componentInput] == circuit.rats_nest[wireKey]) {
                            matchesWireKey = true;
                        }
                    }
                    if (!matchesWireKey) {
                        console.log("WARNING: Input " + componentInput + " on Component " + componentKey + " connects to a wire that doesn't exist! (" + circuit.components[componentKey].inputs[componentInput] + ")");
                    }
                }
            }
            for (let componentOutput in circuit.components[componentKey].outputs) {
                if (circuit.components[componentKey].outputs[componentOutput] == "") {
                    console.log("WARNING: Output " + componentOutput + " on Component " + componentKey + " has no wire connections.");
                }
                if (circuit.components[componentKey].type != "emitter") {
                    let matchesWireKey = false;
                    for (let wireKey in circuit.rats_nest) {
                        if (circuit.components[componentKey].outputs[componentOutput] == circuit.rats_nest[wireKey]) {
                            matchesWireKey = true;
                        }
                    }
                    if (!matchesWireKey) {
                        console.log("WARNING: Output " + componentOutput + " on Component " + componentKey + " connects to a wire that doesn't exist! (" + circuit.components[componentKey].outputs[componentOutput] + ")");
                    }
                }
            }
        }
    }
});