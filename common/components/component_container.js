module.exports = class {
    constructor(objectValues) {
        this._label = "";
        this._x = .5;
        this._y = .5;
        this._scale = 1;
        this._startBit = -1;
        Object.assign(this, objectValues);

        this._bitLength = 0;
        this._componentClass = "component";
        this._type = "component";

        this._inputs = {};
        this._outputs = {};
        this._memory = {};
    }

    get id() { return this._id; }

    get label() { return this._label; }
    set label(_label) { this._label = _label; }

    get x() { return this._x; }
    set x(_x) { this._x = _x; }

    get y() { return this._y; }
    set y(_y) { this._y = _y; }

    get scale() { return this._scale; }
    set scale(_scale) { this._scale = _scale; }

    get component() { return this._componentClass; }

    get type() { return this._type; }

    setInput(connectionName, value) {
        if (this._inputs[connectionName] == undefined) {
            throw "No such input found!";
        }
        this._inputs[connectionName] = JSON.parse(JSON.stringify(value));
    }

    getInputConnectionNames() {
        return this._inputs.keys();
    }

    getOutputConnectionNames() {
        return this._outputs.keys();
    }

    evaluate(bitStream) {};

    addConnection(connections) {
        for (var connectionName in connections) {
            if (this._outputs[connectionName]) {
                this._outputs[connectionName].toComponent = connections[connectionName].toComponent;
                this._outputs[connectionName].toConnector = connections[connectionName].toConnector;
                //} else if (this._inputs[connectionName]) { 
            } else {
                throw "connection does not exist!";
            }
        }
    }

    getDownstreamComponents() {
        let objectOfValues = {};
        for (let connectionName in this._outputs) {
            objectOfValues[connectionName] = {};
            objectOfValues[connectionName].value = this._outputs[connectionName].value
            objectOfValues[connectionName].compo = this._outputs[connectionName].toComponent;
            objectOfValues[connectionName].conne = this._outputs[connectionName].toConnector;
        }
        return objectOfValues;
    }

    removeConnection(connectionNameOrUUID) {
        if (this._outputs[connectionNameOrUUID]) {
            this._outputs[connectionNameOrUUID] = {}
        } else {
            for (let connectionName in this._outputs) {
                if (this._outputs[connectionName].compo = connectionNameOrUUID) {
                    this._outputs[connectionName] = {}
                }
            }
        }
    }
}

/*
Necessary Components
//Outputs
    LED = 1;
    RGBLED = 3;
    LCD = 8;
//Inputs
    button = 1;
    simpleCable = 1;
    2WaySwitch = 1;
    3WaySwitch = 2;
//Gates
    NOT = 1;
    AND = 2;
    OR = 2;
    NAND = 2;
    NOR = 2;
    XOR = 2;
    XNOR = 2;
    Replicator = 1
*/


/*
Additonal Components
//Outputs
    DimmableLED = 8;
    Voltmeter = 8;
    Speaker = 8;
    Servo = 8;
    DimmableRGBLED = 24;
    7seg = 8;
    LEDBar = 10;
    smartCable = 1;
    Buzzer = 1;
    Fiberlight = 1;
    Motor = 1;
    Electro-MagLock = 1;
    DAC = 8;
    API / Websockets
//Inputs
    fiberCable = 1;
    smartCable = 1;
    rotaryEncoder = 3;
    adc = 8;
    chip = 6;
    rod = 6;
    rotarySwitch = 8;
    clock;
    pattern generator (oscillator, etc);
    API / Websockets
//Gates
    BUFF
    ADD
    SUB
    MULT
    DIV
    MOD
    LOG
    SIN
    COS
    TAN
    ROUND
    CEIL
    FLOOR
    D-Latch
    LUT
    MUX
    DMUX
    REG

*/