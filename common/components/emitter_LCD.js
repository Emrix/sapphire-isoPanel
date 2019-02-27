require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "emitter";
        this._type = "generic";

        this._bitLength = 1;

        //Set Up Inputs\\
        this._inputs["A"] = -1;

        //Set Up Memory\\
        this._memory["Phrase0"] = 1;
        this._memory["Phrase1"] = 1;
        this._memory["Phrase2"] = 1;
        this._memory["Phrase3"] = 1;
        this._memory["Phrase4"] = 1;
        this._memory["Phrase5"] = 1;
        this._memory["Phrase6"] = 1;
        this._memory["Phrase7"] = 1;
    }

    //Calculation Functions\\
    evaluate(_bitStream) {
        _bitStream[this._startBit] = this._inputs["A"];
        return _bitStream
    }
}