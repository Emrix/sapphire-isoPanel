module.exports = class {
    constructor() {
        this.uuidv4 = require('uuid/v4');

        this.logicMap = {};
        this.componentEvaluationQueue = [];
        this.componentStabilityMap = {};


        this.componentLibrary = {
            "driver": {
                "generic": require('./components/driver_generic_1_input.js'),
                "generic2": require('./components/driver_generic_2_input.js'),
                "generic3": require('./components/driver_generic_3_input.js'),
                "button": require('./components/driver_button.js'),
                "dumbCable": require('./components/driver_simpleCable.js'),
                "2WaySwitch": require('./components/driver_2WaySwitch.js'),
                "3WaySwitch": require('./components/driver_3WaySwitch.js'),
            },
            "gate": {
                "generic": require('./components/gate_generic.js'),
                "NOT": require('./components/gate_NOT.js'),
                "AND": require('./components/gate_AND.js'),
                "OR": require('./components/gate_OR.js'),
                "NAND": require('./components/gate_NAND.js'),
                "NOR": require('./components/gate_NOR.js'),
                "XOR": require('./components/gate_XOR.js'),
                "XNOR": require('./components/gate_XNOR.js'),
                "replicator": require('./components/gate_replicator.js'),
            },
            "emitter": {
                "generic": require('./components/emitter_generic.js'),
                "LED": require('./components/emitter_LED.js'),
                "RGBLED": require('./components/emitter_RGBLED.js'),
                "LCD": require('./components/emitter_LCD.js'),
            },
        }
    }

    //Start internal Functions\\
    scheduleComponentForEvaluation(uuid) {
        if (!this.logicMap[uuid]) { return -1; }
        if (this.componentEvaluationQueue.indexOf(uuid) != -1) {
            //If a component is already scheduled, it gets removed from the queue
            this.componentEvaluationQueue.splice(this.componentEvaluationQueue.indexOf(uuid), 1);
        }
        this.componentEvaluationQueue.push(uuid);
    }

    scheduleAllComponentsForEvaluation() {
        for (let componentUUID in this.logicMap) {
            this.scheduleComponentForEvaluation(componentUUID);
        }
    }

    evalScheduledComponents(ibitStream, webStream, thoriumStream) {
        let obitStream = [];
        while (this.componentEvaluationQueue.length != 0) {
            var ComponentUUID = this.componentEvaluationQueue.shift();

            var hasChanged = false;

            if (this.componentStabilityMap[ComponentUUID] > 10) {
                /*
                Theoretically, it's possible to get an infinite loop with a -1,
                So to prevent that, this is a hard stop, where the circuit will
                just stop evaluating, and probably throw an error.
                */
                throw ("Invalid Logic Found.  Halting Circuit Simulation. Component ID" + ComponentUUID);

            } else if (this.componentStabilityMap[ComponentUUID] === 7) {
                this.logicMap[ComponentUUID].value = -1;
            } else {
                if (this.logicMap[ComponentUUID].component === "emitter") {
                    obitStream = this.logicMap[ComponentUUID].evaluate(obitStream);
                } else {
                    hasChanged = this.logicMap[ComponentUUID].evaluate(ibitStream, webStream, thoriumStream);
                }
            }


            this.componentStabilityMap[ComponentUUID] += 1; //Increment the stability factor, so we don't get into infinite loop trouble

            if (hasChanged || this.logicMap[ComponentUUID].component === "driver") {
                let componentResults = this.logicMap[ComponentUUID].getDownstreamComponents();
                for (var key in componentResults) {
                    let value = componentResults[key].value;
                    let compo = componentResults[key].compo;
                    let conne = componentResults[key].conne;
                    if (compo != "") {
                        if (!this.logicMap[compo]) {
                            console.log(this.logicMap);
                            throw ("Component not found " + compo);
                        }
                        this.logicMap[compo].setInput(conne, value);
                        this.scheduleComponentForEvaluation(compo);
                    }
                }
            }
        }

        //Set the stability factor of all components to 0
        for (var element in this.componentStabilityMap) {
            this.componentStabilityMap[element] = 0;
        }
        return obitStream;
    }

    //End internal Functions\\


    //Start User Interactions\\
    loadCircuit(logicObject) {
        logicObject = JSON.parse(logicObject);

        for (let key in logicObject) {
            let componentInitObject = {
                _label: logicObject[key]._label,
                _x: logicObject[key]._x,
                _y: logicObject[key]._y,
                _scale: logicObject[key]._scale,
                _startBit: logicObject[key]._startBit,
                _id: logicObject[key]._id,
                _bitLength: logicObject[key]._bitLength,
            }

            this.logicMap[key] = new this.componentLibrary[logicObject[key]._componentClass][logicObject[key]._type](componentInitObject);
            this.componentStabilityMap[key] = 0;
        }
        for (let key in logicObject) {
            for (let connector in logicObject[key]._outputs) {
                this.addConnection(key, connector, logicObject[key]._outputs[connector]._tocomponent, logicObject[key]._outputs[connector]._toConnector);
            }
        }
    }

    saveCircuit() {
        return JSON.stringify(this.logicMap);
    }

    removeComponent(componentUUID) {
        if (!this.logicMap[componentUUID]) {
            return 1; //Fail, component not found
        }
        delete this.logicMap[componentUUID];
        delete this.componentStabilityMap[componentUUID];
        for (let key in this.logicMap) {
            this.logicMap[key].removeConnection(componentUUID);
        }
        return 0;
    }

    evaluateCircuit(bitStream, webStream, thoriumStream) {
        this.scheduleAllComponentsForEvaluation();
        return this.evalScheduledComponents(bitStream, webStream, thoriumStream);
    }

    addConnection(fromComponentUUID, fromConnectorName, toComponentUUID, toConnectorName) {
        if (this.logicMap[fromComponentUUID] && this.logicMap[toComponentUUID]) {
            var connections = {}
            connections[fromConnectorName] = {
                toComponent: toComponentUUID,
                toConnector: toConnectorName,
            }
            this.logicMap[fromComponentUUID].addConnection(connections);
            return 0; //Success
        } else {
            return 1; //Fail
        }
    }

    addComponent(componentClass, componentType, startBit) {
        let componentID = this.uuidv4();
        let componentInitObject = {
            _id: componentID,
            _label: ("New " + componentClass),
            _x: 1,
            _y: 1,
            _scale: 1,
            _startBit: startBit,
        }

        this.logicMap[componentID] = new this.componentLibrary[componentClass][componentType](componentInitObject);
        this.componentStabilityMap[componentID] = 0;
        return componentID;
    }
    //End User Interactions\\
}