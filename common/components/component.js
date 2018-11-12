exports.circuitComponent = class {
    constructor() {
        this._label = "";
        this._x = .5;
        this._y = .5;
        this._scale = 1;
        this._component = "component";
        this._type = "component";
        this._startBit = 0;
        this._bitLength = 1;
        this._value = -1;

        //inputs
        //outputs
        //Memory
        //function?

        /*
        LED = 1;
        DimmableLED = 8;
        Voltmeter = 8;
        Speaker = 8;
        Servo = 8;
        RGBLED = 3;
        DimmableRGBLED = 24;
        LCD = 8;
        7seg = 8;
        LEDBar = 10;
        Buzzer = 1;
        Fiberlight = 1;
        Motor = 1;
        Electro-MagLock = 1;
        button = 1;
        dumbCable = 1;
        fiberCable = 1;
        smartCable = 1;
        2WaySwitch = 1;
        3WaySwitch = 2;
        rotaryEncoder = 3;
        adc = 8;
        chip = 6;
        rod = 6;
        rotarySwitch = 8;
        */
    }

    get label() { return this._label; }
    set label(_label) { this._label = _label; }

    get x() { return this._x; }
    set x(_x) { this._x = _x; }

    get y() { return this._y; }
    set y(_y) { this._y = _y; }

    get scale() { return this._scale; }
    set scale(_scale) { this._scale = _scale; }

    get component() { return this._component; }
    set component(_component) { this._component = _component; }

    get type() { return this._type; }
    set type(_type) { this._type = _type; }

    get startBit() { return this._startBit; }
    set startBit(_startBit) { this._startBit = _startBit; }

    get bitLength() { return this._bitLength; }
    set bitLength(_bitLength) { this._bitLength = _bitLength; }

    get value() { return this._value; }
    set value(_value) { this._value = _value; }

    /*
    setBitValue(_bitArray) {
        let bitArrayLength = _bitArray.length;
        let floatTotal = 0;
        let intMax = Math.pow(2, bitArrayLength) - 1;
        for (let x = 0; x < bitArrayLength; x++) {
            if (_bitArray[bitArrayLength - x - 1] != 0) {
                floatTotal += Math.pow(2, x) / intMax;
            }
        }
        this.value = floatTotal;
    }

    getBitValue() {
        let intMax = Math.pow(2, this.bitLength) - 1;
        this.value = Math.min(Math.max(0, this.value), 1);
        let binaryString = Math.round(intMax * this.value);
        binaryString = parseInt(binaryString, 10);
        binaryString = binaryString.toString(2);
        let binary = [];
        for (let x = 0;
            (binary.length + binaryString.length) < this.bitLength; x++) {
            binary[x] = 0;
        }
        let appendedZeros = binary.length;
        for (let x = 0; x < binaryString.length; x++) {
            binary[appendedZeros + x] = parseInt(binaryString[x]);
        }
        return binary;
    }
    */
}