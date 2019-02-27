var configFile = "default.json";

//Start Create server
var handler = (req, res) => {
    var itemToSend = "";
    var mimeType = "";
    var loadFile = false;
    var request = req.url;
    request = request.split("?");
    switch (request[0]) {
        case ("/configuration.js"):
            itemToSend = "/public/configuration.js";
            mimeType = "application/javascript";
            loadFile = true;
            break;
        case ("/websockets.js"):
            itemToSend = "/public/websockets.js";
            mimeType = "application/javascript";
            loadFile = true;
            break;
        case ("/index.css"):
            itemToSend = "/public/index.css";
            var mimeType = "text/css";
            loadFile = true;
            break;
        case ("/loadConfig"):
            var itemToSend = request[1];
            itemToSend = itemToSend.replace("../", "./");
            configFile = itemToSend;
            FSM.inputs.configure = 1;
            itemToSend = "/config/" + itemToSend;
            var mimeType = "application/json";
            loadFile = true;
            break;
        case ("/configList"):
            itemToSend = "/config/";
            var mimeType = "text/plain";
            loadFile = false;
            break;
        default:
            itemToSend = "/public/index.html";
            var mimeType = "text/html";
            loadFile = true;
            break;
    }

    if (loadFile) {
        fs.readFile((__dirname + itemToSend), function(err, data) { //read file index.html in public folder
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' }); //display 404 on error
                return res.end("404 Not Found");
            }
            res.writeHead(200, { 'Content-Type': mimeType }); //write HTML
            res.write(data); //write data from index.html
            if (debugMode) console.log("Web User loaded Page");
            return res.end();
        });
    } else {
        switch (itemToSend) {
            case "/config/":
                //                fs.readdir((__dirname + itemToSend), (err, files) => {
                fs.readdir(__dirname + itemToSend, (err, files) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/html' }); //display 404 on error
                        return res.end("404 Not Found");
                    }
                    files = JSON.stringify(files);
                    res.writeHead(200, { 'Content-Type': mimeType }); //write HTML
                    res.write(files);
                    return res.end();
                })
                break;
            default:
                res.writeHead(404, { 'Content-Type': 'text/html' }); //display 404 on error
                return res.end("404 Not Found");
                break;
        }
    }
}
//End Create server

//Start Libraries
var http = require('http').createServer(handler); //require http server, and create server with handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
if (isAPi) {
    var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
} else {
    var Gpio = { //This is a mock GPIO library so that the code will still work outside of a raspberry pi. This is used for debugging.
        writeSync: () => {},
        unexport: () => {},
        watch: () => {},
        readSync: () => {
        	return 1;
            var y = Math.random();
            if (y < 0.5) {
                y = Math.floor(y)
            } else {
                y = Math.ceil(y)
            }
            return y;
            //return 0;
        }
    }
}
var uuidv4 = require('uuid/v4');
//Bonjour
var bonjour = require('bonjour')()
var thoriumServer;
var client;
//End Bonjour
//End Libraries

//Start Declare Pins here
if (isAPi) {
    var CE0 = new Gpio(8, 'out'); //Should be 8
    var CE1 = new Gpio(7, 'out');
    var SCLK = new Gpio(11, 'out');
    var MOSI = new Gpio(10, 'out');
    var MISO = new Gpio(9, 'in', 'both');
    var PWR = new Gpio(23, 'in', 'both');
} else {
    var CE0 = Gpio;
    var CE1 = Gpio;
    var SCLK = Gpio;
    var MOSI = Gpio;
    var MISO = Gpio;
    var PWR = Gpio;
}
var outputPins = [CE0, CE1, SCLK, MOSI];
var inputPins = [MISO, PWR];
//End declaring pins

//Start Declare Variables
const MAX_IO = 100;
var SPIbitOutputs = [];
var SPIbitInputs = [];
var SPIfloatOutputs = {};
var SPIfloatInputs = {};
var WEBoutputs = {};
var WEBinputs = {};
var THORIUMoutputs = {};
var THORIUMinputs = {};
for (var x = 0; x < MAX_IO; x++) {
    SPIbitInputs[x] = -1;
}
var debugMode = true;
var isAPi = false;
var oldcircuitString = {};
var circuit = {};
//End Declare Variables






const initialize = {
    state: "initialize",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        //Start WebServer
        http.listen(8080);
        //End WebServer

        //Start Bonjour
        bonjour.find({ type: 'thorium-http' }, function(service) {
            var thoriumServer = service.addresses[0];
            if (debugMode) console.log('Found an HTTP server:', service)
            //GraphQL
            client = require('graphql-client')({
                url: "http://" + thoriumServer + ":3001/graphql",
                //url: "http://192.168.1.203:3001/graphql",
                headers: {
                    //Authorization: 'Bearer ' + token
                }
            })
            //EndGraphQL
            FSM.inputs.thoriumIsAvailable = 1;
        })
        //End Bonjour
    },
    nextState() {
        FSM = configuring;
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const configuring = {
    state: "configuring",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        FSM.inputs.configure = 0;
        if (debugMode) console.log("Grab the specified Config File: " + configFile);
        //Start Parse Config File
        fs.readFile((__dirname + '/config/' + configFile), { encoding: 'utf-8' }, function(err, data) { //read file config.json
            if (err) {
                throw "unable to configure";
            } else {
                //Registers itself and current configuration on the thorium Server
                /* I'd need to set the client veriable again, and I'm not sure if that'll work or not. */
                //initializes the circuit into the logical analyzer
                circuit = JSON.parse(data).circuit;
                //Get the Panel Inputs & outputs from the Circuit, and store them in a key-value map UUID as key
                for (component in circuit) {
                    if (circuit[component].type === "P-IN") {

                    }
                }

                //Get the Panel outputs from the Circuit, and store them in a key-value map UUID as key
                for (component in circuit) {
                    if (circuit[component].type === "P-OUT") {

                    }
                }

                /* I don't need to do this right now until Thorium is actually integrated */
                //Get the thorium queries and store them in keyvalue map with the UUID as key
                //Get the thorium mutations and store them in keyvalue map with the UUID as key
            }
        });
        //End Parse Config File
        //FSM.nextState();
    },
    nextState() {
        FSM = spiIN;
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const spiIN = {
    state: "spiIN",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        if (debugMode) console.log("Latch");
        //Start running the poller
        //Pulse the latch
        CE0.writeSync(1);
        CE0.writeSync(0);
        if (debugMode) console.log("Shift in a specified number of bits and into an array");
        for (var x = 0; x < MAX_IO; x++) {
            //Clock tick
            SCLK.writeSync(1);
            SCLK.writeSync(0);
            //Read input
            SPIbitInputs[x] = MISO.readSync();
        }
        if (debugMode) {
            var outputString = "";
            for (var x = 0; x < MAX_IO; x++) {
                outputString += ("Input " + x + " = " + SPIbitInputs[x] + "\t");
            }
            //console.log(outputString);
        };
        //End running the poller

        //Start Bool Parser
        //Loop through each of the components in the current circuit
        function bitToFloat(bitArray) {
            let bitLength = bitArray.length;
            let floatTotal = 0;
            let intMax = Math.pow(2, bitLength) - 1;
            for (x = 0; x < bitLength; x++) {
                if (bitArray[bitLength - x - 1] != 0) {
                    floatTotal += Math.pow(2, x) / intMax;
                }
            }
            return floatTotal;
        }
        for (x in circuit) {
            if (circuit[x].component === "driver") {
                let dataStartbit = circuit[x].startBit;
                let dataBitLength = 0;
                switch (circuit[x].type) {
                    case "button":
                        dataBitLength = 1;
                        break;
                    case "dumbCable":
                        dataBitLength = 1;
                        break;
                    case "fiberCable":
                        dataBitLength = 1;
                        break;
                    case "smartCable":
                        dataBitLength = 1;
                        break;
                    case "2WaySwitch":
                        dataBitLength = 1;
                        break;
                    case "3WaySwitch":
                        dataBitLength = 2;
                        break;
                    case "rotaryEncoder":
                        dataBitLength = 3;
                        break;
                    case "adc":
                        dataBitLength = 8;
                        break;
                    case "chip":
                        dataBitLength = 6;
                        break;
                    case "rod":
                        dataBitLength = 6;
                        break;
                    case "rotarySwitch":
                        dataBitLength = 8;
                        break;
                    default:
                        throw ("Unknown Driver Type " + circuit[x].type);
                }
                //Map all of the inputs to their respective components
                SPIfloatInputs[x] = bitToFloat(SPIbitInputs.slice(dataStartbit, (dataStartbit + dataBitLength)));
            }
        }
        //console.log(SPIfloatInputs);
    },
    nextState() {
        if (FSM.inputs.thoriumIsAvailable) {
            FSM = thoriumIN;
        } else {
            FSM = process;
        }
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const webIN = {
    state: "webIN",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        if (debugMode) console.log("grab the stored data from the web inputs (We may not technically need this state, because it should do it's thing automatically...)");
        //Stage 1 of the ibuff
        //Convert floats into string of array based on component types
        /*
        WebIN comes in mapped like this
        {
        	UUID: Float,
        	UUID: Float,
        }
        */
    },
    nextState() {
        FSM = process;
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const thoriumIN = {
    state: "thoriumIN",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        if (debugMode) console.log("Parse through all of the components that require a thorium server query (Probably already parsed from the configuration state)");

        //Client for graphql
        let queryVar = `
{
	subscription {
		softwarePanels {
			id
			name
			cables {
				id
				color
				components
			}
			components {
				id
				component
				level
				label
				color
				x
				y
				scale
			}
			connections {
				id
				to
				from
			}
		}
	}
}
`;
        let variables = {
            query: "Search Query",
            limit: 100,
            from: 200
        }
        //Start the Query to Thorium
        client.query(queryVar, variables, function(req, res) {
                if (res.status === 401) {
                    throw new Error('Not authorized');
                }
            })
            .then(function(body) {
                if (debugMode) console.log("Thorium Request Received");
                if (debugMode) console.log(JSON.stringify(body));
                //Stage 1 of the ibuff
                /*
                WebIN comes in mapped like this
                {
                	UUID: Float,
                	UUID: Float,
                }
                */
            })
            .catch(function(err) {
                if (debugMode) console.log(err.message);
            })
        //end the Query to Thorium
        if (debugMode) console.log("put it into a keyvalue map with the key being the UUID of the component, and the value being the result of the query");
    },
    nextState() {
        FSM = process;
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const process = {
    state: "process",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        oldcircuitString = JSON.stringify(circuit);

        //////////Variables\\\\\\\\\\
        let scheduler = [];
        let stabilityMap = {};

        ///////Check Variables\\\\\\\
        for (x in circuit) {
            if (circuit[x].component === "driver") {
                switch (true) {
                    case (WEBinputs[x] != undefined):
                        circuit[x].level = WEBinputs[x];
                        break;
                    case (!FSM.inputs.thoriumIsAvailable):
                        circuit[x].level = SPIfloatInputs[x];
                        break;
                    case (THORIUMinputs[x] == circuit[x].level):
                        circuit[x].level = SPIfloatInputs[x];
                        break;
                    case (THORIUMinputs[x] != circuit[x].level):
                        circuit[x].level = THORIUMinputs[x];
                        break;
                    default:
                        throw "Bee-doh-bee-doh-bee-doh";
                        break;
                }
            }
            delete WEBinputs[x];
            delete THORIUMinputs[x];
            delete SPIfloatInputs[x];
        }
        scheduleComponent();
        evalScheduledComponents();

        //////////Circuit Design Functions\\\\\\\\\\
        function importCircuit(circuitToImport) {
            //Import all of the components (Validation is done while the circuit is created)
            for (component in circuitToImport) {
                var status = addCircuitComponent(circuitToImport, circuitToImport[component].component, circuitToImport[component].type, circuitToImport[component].level);
                if (status < 0) {
                    return "Import Failed: " + component + " could not be imported.  Error Code: " + status;
                }
            }
            //Import all of the connections (Validation is done while the circuit is created)
            for (component in circuitToImport) {
                for (toConnection in circuitToImport[component].to) {
                    var status = addConnection(circuitToImport, toConnection);
                    if (status < 0) {
                        return "Import Failed: " + circuitToImport + " to " + toConnection + " could not be connected.  Error Code: " + status;
                    }
                }
            }
            //If there were no errors thrown, then we assign the entire circuit to the imported map
            //This is so some of our math equations can work out properly.
            circuit = circuitToImport;
            return "Import Successful!";
        }

        function addCircuitComponent(uuid, component, type, level) {
            if (!level) {
                level = -1; //Give the component a starting level if one is not specified
                //-1 represents an "Unknown" state for a component.
                //This is usually the case when the component is
                //initialized for the first time,  or unstable,
                //meaning it switches between 2 levels.
            }
            if (!type) { type = component }; //Validate the type
            if (!uuid) { uuid = uuidv4() }; //Validate the UUID

            if (debugMode) { console.log("Adding " + circuit[uuid].component + " with level " + circuit[uuid].level + " to Circuit: " + uuid); }

            if (component != "emitter" && component != "driver" && component != "gate") {
                return -2; //Cannot make an unknown kind of component
            }

            //Create the component
            circuit[uuid] = {
                "component": component,
                "type": type,
                "level": level,
                "to": [],
                "from": [],
            }
            stabilityMap[uuid] = 0; //Create a mapping for the component's stability
            return uuid;
        }

        function removeCircuitComponent(uuid) {
            if (!circuit[uuid]) {
                return -1; //UUID doesn't exist
            }

            if (debugMode) { console.log("Removing " + circuit[uuid].component + " from Circuit: " + uuid); }

            delete circuit[uuid]; //Delete the component from the circuit

            //remove the associated connections on to and from components
            for (var x in circuit) {
                while (circuit[x].to.indexOf(uuid) != -1) {
                    circuit[x].to.splice(circuit[x].to.indexOf(uuid), 1);
                }
                while (circuit[x].from.indexOf(uuid) != -1) {
                    circuit[x].from.splice(circuit[x].from.indexOf(uuid), 1);
                }
            }
        }

        function addConnection(fromUUID, toUUID) {
            if (!circuit[fromUUID] || !circuit[toUUID]) {
                return -1; //UUID doesn't exist
            }
            if (circuit[fromUUID].component === "emitter" || circuit[toUUID].component === "driver") { //emitter doesn't have a "to", and driver doesn't have a "from"
                return -2; //Specified Component cannot make connection
            }

            //Attach the connection to the upstream component
            circuit[fromUUID].to.push(toUUID)
            //Attach the connection to the downstream component
            if (circuit[toUUID].component === "emitter" || circuit[toUUID].type === "NOT" ||
                circuit[toUUID].type === "BUFF" || circuit[toUUID].type === "LOG" ||
                circuit[toUUID].type === "SIN" || circuit[toUUID].type === "COS" ||
                circuit[toUUID].type === "TAN" || circuit[toUUID].type === "ROUND" ||
                circuit[toUUID].type === "CEIL" || circuit[toUUID].type === "FLOOR") {
                //Components can only have one input
                circuit[toUUID].from[0] = fromUUID;
            } else {
                //The rest of them can have many inputs
                circuit[toUUID].from.push(fromUUID);
            }
            if (debugMode) { console.log("Added " + circuit[uuid].component + " from Circuit: " + uuid); }
            return 0; //Success
        }

        function removeConnection(fromUUID, toUUID) {
            if (!circuit[fromUUID] || !circuit[toUUID]) {
                return -1; //UUID doesn't exist
            }
            //Remove the connection from upstream and downstream components
            if (circuit[fromUUID].to.indexOf(toUUID) != -1) {
                circuit[fromUUID].to.splice(circuit[fromUUID].to.indexOf(toUUID), 1);
            }
            if (circuit[toUUID].from.indexOf(fromUUID) != -1) {
                circuit[toUUID].from.splice(circuit[toUUID].from.indexOf(fromUUID), 1);
            }
            return 0; //Success
        }

        //////////Logic Simulation\\\\\\\\\\
        function toggleDriver(uuid, level) {
            if (!circuit[uuid]) {
                return -1; //UUID doesn't exist
            }
            if (circuit[uuid].type != "toggle") {
                return -2; //Not a toggleable component
            }
            if (debugMode) { console.log("Toggling " + circuit[uuid].component + " to " + level + ": " + uuid); }
            circuit[uuid].level = verifyInputs(level); //Validate inputs
            scheduleComponent(uuid); //Reschedule this component to be evaluated
            return evalScheduledComponents(); //Evaluate the scheduled components
        }

        function verifyInputs(inputs) {
            //Loop through each item in the array
            for (var x = 0; x < inputs.length; x++) {
                if (typeof(inputs[x]) != "number") {
                    //Verify that it is a number,
                    //else we initialize to our special number.
                    inputs[x] = -1;
                } else if (inputs[x] === -1) {
                    //-1 is a special level
                    //So we don't do much here...
                } else {
                    //verify that it is within bounds
                    inputs[x] = Math.max(inputs[x], 0);
                    inputs[x] = Math.min(inputs[x], 1);
                }
            }
            return inputs;
        };

        function scheduleComponent(uuid) {
            if (!uuid) {
                if (debugMode) { console.log("Scheduling all components"); }
                for (component in circuit) {
                    scheduleComponent(component);
                }
            } else {
                if (!circuit[uuid]) {
                    return -1; //UUID doesn't exist
                }
                if (debugMode) { console.log("Scheduling component " + circuit[uuid].component + ": " + uuid + " @ " + circuit[uuid].level); }
                if (scheduler.indexOf(uuid) != -1) {
                    scheduler.splice(scheduler.indexOf(uuid), 1); //If a component is already scheduled, it gets removed
                }
                scheduler.push(uuid); //Schedule the component (on the back of the queue)
            }
            return 0;
        }

        function evalScheduledComponents() {
            if (scheduler.length === 0) { //Everything has been evaluated, and the circuit is stable
                if (debugMode) { console.log("circuit analysis: stable"); }
                //Set the stability factor of all components to 0
                for (var element in stabilityMap) {
                    stabilityMap[element] = 0;
                }
                return "Stable Circuit";
            }
            var uuid = scheduler.shift(); //Get the front component off the queue for evaluation

            var oldValue = circuit[uuid].level;

            //Check the stability of the component
            if (stabilityMap[uuid] > 10) {
                if (debugMode) { console.log("Invalid Logic Found.  Halting Circuit Simulation. Component ID" + uuid); }
                /*
                Theoretically, it's possible to get an infinite loop with a -1,
                So to prevent that, this is a hard stop, where the circuit will
                just stop evaluating, and probably throw an error.
                */
                throw ("Invalid Logic Found.  Halting Circuit Simulation. Component ID" + uuid);

            } else if (stabilityMap[uuid] === 7) { //Component is deemed as unstable, it cannot settle on a specific level
                if (debugMode) { console.log("Component Unstable " + circuit[uuid].component + ": " + uuid); }
                //Stabalize it by assigning it's level to a -1
                circuit[uuid].level = -1;

            } else {
                evalComoponent(uuid); //Everything is good, and we evaluate the component!
            }

            if (debugMode) { console.log("New Value is " + circuit[uuid].level + " for component " + circuit[uuid].component + ": " + uuid); }

            stabilityMap[uuid] += 1; //Increment the stability factor, so we don't get into infinite loop trouble
            if (debugMode) { console.log("Incrementing Stability Factor to " + circuit[uuid].stabilityFactor + " for " + circuit[uuid].component + ": " + uuid); }

            //If the component has changed level in the evaluation, then we schedule everything downstream of the component
            if (oldValue != circuit[uuid].level || circuit[uuid].component === "driver") {
                //schedule all of the components that are downstream
                for (var x = 0; x < circuit[uuid].to.length; x++) {
                    scheduleComponent(circuit[uuid].to[x]);
                }
            }
            return evalScheduledComponents(); //Continue on the queue of scheduled components
        }

        function evalComoponent(uuid) {
            var component = circuit[uuid]; //Grab the component from the circuit.
            if (!component) {
                return -1; //UUID doesn't exist
            }
            if (debugMode) { console.log("Evaluating " + circuit[uuid].component + " with '" + circuit[uuid].level + "': " + uuid); }

            //Find all of the inputs to the component
            var inputs = [];
            for (var x in component.from) {
                inputs.push(circuit[component.from[x]].level);
            }
            inputs = verifyInputs(inputs);

            //Do the evaluation of the component.
            //Each component has a specific way to be evaluated,
            //based on the kind of component, and it's type.
            switch (component.component) {
                case "emitter":
                    circuit[uuid].level = inputs[0];
                    break;
                case "driver":
                    switch (component.type) {
                        case "constant":
                            break;
                        case "toggle":
                            break;
                    }
                    break;
                case "gate":
                    switch (component.type) {
                        ///Logic Gates\\\
                        case "NOT":
                            if (inputs[0] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = Math.round(inputs[0]) > .5 ? 0 : 1;
                            }
                            break;
                        case "AND":
                            var result = 1;
                            inputs.forEach(function(element) {
                                if (element >= 0 && element < .5) {
                                    result = 0;
                                    return;
                                }
                                if (element === -1 && result != 0) {
                                    result = -1;
                                    return;
                                }
                            });
                            circuit[uuid].level = result;
                            break;
                        case "OR":
                            var result = 0;
                            inputs.forEach(function(element) {
                                if (element >= .5) {
                                    result = 1;
                                    return;
                                }
                                if (element === -1 && result != 1) {
                                    result = -1;
                                    return;
                                }
                            });
                            circuit[uuid].level = result;
                            break;
                        case "NAND":
                            var result = 1;
                            inputs.forEach(function(element) {
                                if (element >= 0 && element < .5) {
                                    result = 0;
                                    return;
                                }
                                if (element === -1 && result != 0) {
                                    result = -1;
                                    return;
                                }
                            });
                            if (result != -1) {
                                circuit[uuid].level = (result ? 0 : 1);
                            } else {
                                circuit[uuid].level = result;
                            }
                            break;
                        case "NOR":
                            var result = 0;
                            inputs.forEach(function(element) {
                                if (element >= .5) {
                                    result = 1;
                                    return;
                                }
                                if (element === -1 && result != 1) {
                                    result = -1;
                                    return;
                                }
                            });
                            if (result != -1) {
                                circuit[uuid].level = (result ? 0 : 1);
                            } else {
                                circuit[uuid].level = result;
                            }
                            break;
                        case "XOR":
                            var result = 0;
                            var hasAnX = false;
                            inputs.forEach(function(element) {
                                if (element === -1) {
                                    hasAnX = true;
                                }
                                if (element > .5) {
                                    result++;
                                }
                            });
                            if (hasAnX) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = result % 2;
                            }
                            break;
                        case "XNOR":
                            var result = 1;
                            var hasAnX = false;
                            inputs.forEach(function(element) {
                                if (element === -1) {
                                    hasAnX = true;
                                }
                                if (element > .5) {
                                    result++;
                                }
                            });
                            if (hasAnX) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = result % 2;
                            }
                            break;
                        case "BUFF":
                            circuit[uuid].level = inputs[0];
                            break;
                            ///Mathematic Gates\\\
                        case "ADD":
                            var result = 0;
                            inputs.forEach(function(element) {
                                if (element != -1) {
                                    result += element;
                                }
                                return;
                            });
                            circuit[uuid].level = result;
                            break;
                        case "SUB":
                            if (inputs[0] === -1 || inputs[1] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = (inputs[0] - inputs[1]);
                            }
                            break;
                        case "MULT":
                            var result = 1;
                            inputs.forEach(function(element) {
                                if (element != -1) {
                                    result *= element;
                                }
                                return;
                            });
                            circuit[uuid].level = result;
                            break;
                        case "DIV":
                            if (inputs[0] === -1 || inputs[1] === -1 || inputs[1] === 0) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = (inputs[0] / inputs[1]);
                            }
                            break;
                        case "MOD":
                            if (inputs[0] === -1 || inputs[1] === -1 || inputs[1] === 0) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = (inputs[0] % inputs[1]);
                            }
                            break;
                        case "LOG":
                            if (inputs[0] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = Math.log(inputs[0]);
                            }
                            break;
                        case "SIN":
                            if (inputs[0] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = Math.sin(inputs[0]);
                            }
                            break;
                        case "COS":
                            if (inputs[0] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = Math.cos(inputs[0]);
                            }
                            break;
                        case "TAN":
                            if (inputs[0] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = Math.tan(inputs[0]);
                            }
                            break;
                        case "ROUND":
                            if (inputs[0] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = Math.round(inputs[0]);
                            }
                            break;
                        case "CEIL":
                            if (inputs[0] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = Math.ceil(inputs[0]);
                            }
                            break;
                        case "FLOOR":
                            if (inputs[0] === -1) {
                                circuit[uuid].level = -1;
                            } else {
                                circuit[uuid].level = Math.floor(inputs[0]);
                            }
                            break;
                    }
                    break;
            }
        }

        if (debugMode) console.log("run through the logical analyzer, and create our outputs");
        if (debugMode) console.log("if nothing has changed, then we go back to our SPI Inputs");
        if (debugMode) console.log("we need to increment some sort of clock for the Logical analyzer.  Actually, the components themselves might do this...");
    },
    nextState() {
        if (this.inputs.shutdown) {
            FSM = shutdown;
        } else if (this.inputs.configure) {
            FSM = configuring;
        } else if (oldcircuitString != JSON.stringify(circuit)) {
            FSM = spiOUT;
        } else {
            FSM = spiIN;
        }
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const spiOUT = {
    state: "spiOUT",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        //Ok, so everything is in the circuit
        //Loop through circuit, and put all of the emitters into SPIfloatOutputs
        for (x in circuit) {
            if (circuit[x].component === "emitter") {
                SPIfloatOutputs[x] = circuit[x].value;
            }
        }
        //loop through SPIfloatOutputs, and convert them into the bit lengths,
        //and insert them into the SPIbitOutputs
        function floatToBit(floatTotal, bitLength) {
            let intMax = Math.pow(2, bitLength) - 1;
            floatTotal = Math.min(Math.max(0, floatTotal), 1);
            let binaryString = Math.round(intMax * floatTotal);
            binaryString = parseInt(binaryString, 10);
            binaryString = binaryString.toString(2);
            let binary = [];
            for (x = 0;
                (binary.length + binaryString.length) < bitLength; x++) {
                binary[x] = 0;
            }
            let appendedZeros = binary.length;
            for (x = 0; x < binaryString.length; x++) {
                binary[appendedZeros + x] = parseInt(binaryString[x]);
            }
            return binary;
        }


        for (x in SPIfloatOutputs) {
            let dataStartbit = circuit[x].startBit;
            let dataBitLength = 0;
            switch (circuit[x].type) {
                case "LED":
                    dataBitLength = 1;
                    break;
                case "DimmableLED":
                    dataBitLength = 8;
                    break;
                case "Voltmeter":
                    dataBitLength = 8;
                    break;
                case "Speaker":
                    dataBitLength = 8;
                    break;
                case "Servo":
                    dataBitLength = 8;
                    break;
                case "RGBLED":
                    dataBitLength = 3;
                    break;
                case "DimmableRGBLED":
                    dataBitLength = 24;
                    break;
                case "LCD":
                    dataBitLength = 8;
                    break;
                case "7seg":
                    dataBitLength = 8;
                    break;
                case "LEDBar":
                    dataBitLength = 10;
                    break;
                case "SmartCable":
                    dataBitLength = 1;
                    break;
                case "Buzzer":
                    dataBitLength = 1;
                    break;
                case "Fiberlight":
                    dataBitLength = 1;
                    break;
                case "Motor":
                    dataBitLength = 1;
                    break;
                case "Electro-MagLock":
                    dataBitLength = 1;
                    break;
                default:
                    throw ("Unknown Emitter Type " + circuit[x].type);
            }
            //Value comes in as a float, and then I need to 
            //Map all of the inputs to their respective components
            var temp = floatToBit(SPIfloatOutputs[x], dataBitLength);
            for (y = 0; y < dataBitLength; y++) {
                SPIbitOutputs[dataStartbit + y] = temp[y];
            }
        }
        //		console.log(SPIfloatOutputs);
        //		console.log(SPIbitOutputs);



        //Latch
        if (debugMode) console.log("Latch");
        //Start running the poller
        //Pulse the latch
        CE1.writeSync(1);
        CE1.writeSync(0);


        //Load the SPI outputs into the system
        if (debugMode) console.log("Shift in a specified number of bits and into an array");
        for (var x = 0; x < MAX_IO; x++) {
            //Write Output
            MOSI.writeSync(SPIbitOutputs[x])
            //Clock tick
            SCLK.writeSync(1);
            SCLK.writeSync(0);
        }
        if (debugMode) {
            var outputString = "";
            for (var x = 0; x < MAX_IO; x++) {
                outputString += ("Output " + x + " = " + SPIbitOutputs[x] + "\t");
            }
            //console.log(outputString);
        };
        //End running the poller
    },
    nextState() {
        if (FSM.inputs.thoriumIsAvailable) {
            FSM = thoriumOUT;
        } else {
            FSM = webOUT;
        }
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const thoriumOUT = {
    state: "thoriumOUT",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        if (debugMode) console.log("Parse through all of the components that require a thorium server mutation (Probably already parsed from the configuration state)");
        if (debugMode) console.log("Perform the query");

    },
    nextState() {
        FSM = webOUT;
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const webOUT = {
    state: "webOUT",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        if (debugMode) console.log("Update the web UI with the current state of the components & other values");
        for (GUID in circuit) {
            if (circuit[GUID].component === "driver" || circuit[GUID].component === "emitter") {
                let componentValue = circuit[GUID].level;
                if (componentValue === -1) {
                    componentValue = 0;
                    console.log(GUID + " component value is " + -1);
                }
                io.sockets.emit("IOchange", {
                    "component": GUID,
                    "value": componentValue //This might need tp be changed based on the input
                }); //send button status to server (as 1 or 0)
            } else {
                //It's a gate!  Which we don't care about on the UI!
            }
        }
    },
    nextState() {
        FSM = spiIN;
        FSM.inputs = this.inputs;
        FSM.operate();
        return FSM.state;
    },
}

const shutdown = {
    state: "shutdown",
    inputs: {
        shutdown: 0,
        configure: 0,
        thoriumIsAvailable: 0,
    },
    operate: () => {
        if (debugMode) console.log("Notify Thorium that the panel is shutting down, and may need to ");
        //Start Clean Up GPIO
        outputPins.forEach(function(currentValue) { //for each CE0
            currentValue.writeSync(0); //turn off CE0
            currentValue.unexport(); //unexport GPIO
        });
        inputPins.forEach(function(currentValue) { //for each CE0
            currentValue.unexport(); //unexport GPIO to free resources
        });
        //End Clean Up GPIO
        //Start Notify Thorium

        //make some sort of query, and unsubscribe from all the things...

        //End Notify Thorium
        //Start Shutdown Webserver
        http.close(function() {
            console.log("Webserver Stopped");
        });
        //End Shutdown Webserver

        if (debugMode) console.log("shutdown the pi");
    },
    nextState() {
        FSM.operate();
        return FSM.state;
    },
}


//Start Initialize and run State Machine
var FSM = initialize; //Initial State
FSM.operate(); //Run our initialization State

//Run the State Machine
function proceedToNextState() {
    var currentState = FSM.state;
    var t0 = new Date().getTime();
    FSM.nextState();
    var t1 = new Date().getTime();
    if (debugMode) console.log("****Call to " + currentState + " took " + (t1 - t0) + " milliseconds.");
    setTimeout(proceedToNextState, 1000);
}
if (debugMode) console.log("starting state machine")
proceedToNextState();
//End Initialize and run State Machine









//Start Input Detections
//Start Listening for Control - C
if (isAPi) {
    process.on('SIGINT', function() {
        unexportOnClose();
        process.exit(); //exit completely
    }); //function to run when user closes using ctrl+c
}
//End Listening for Control - C


//Start Watch PWR
PWR.watch(function(err, value) { //Watch for hardware interrupts on powerButton
    if (err) { //if an error
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log("Power button pressed"); //output error message to console
    //lightvalue = value;
    //socket.emit('light', lightvalue); //send button status to client
});
//End Watch PWR


//Start WebSockets
io.sockets.on('connection', function(socket) { // WebSocket Connection
    //Start Watch vars from Webpage
    socket.on('IOchange', function(data) { //get light switch status from client
        if (debugMode) console.log("Web Change " + JSON.stringify(data));
        WEBinputs[data.component] = data.value;
    });
    //End Watch vars from Webpage
});
//End WebSockets

//End Input Detections