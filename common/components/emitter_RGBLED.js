require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "emitter";
        this._type = "RGB LED";

        this._bitLength = 3;

        //Set Up Inputs\\
        this._inputs["R"] = -1;
        this._inputs["G"] = -1;
        this._inputs["B"] = -1;
    }

    //Calculation Functions\\
    evaluate(_bitStream) {
        _bitStream[this._startBit] = this._inputs["R"];
        _bitStream[this._startBit+1] = this._inputs["G"];
        _bitStream[this._startBit+2] = this._inputs["B"];
        return _bitStream
    }
}