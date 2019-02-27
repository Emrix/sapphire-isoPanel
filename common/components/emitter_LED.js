require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "emitter";
        this._type = "LED";

        this._bitLength = 1;

        //Set Up Inputs\\
        this._inputs["A"] = -1;
    }

    //Calculation Functions\\
    evaluate(_bitStream) {
        _bitStream[this._startBit] = this._inputs["A"];
        return _bitStream
    }
}