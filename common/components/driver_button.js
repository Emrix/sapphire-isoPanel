require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "driver";
        this._type = "button";

        this._bitLength = 1;

        //Set Up Outputs\\
        this._outputs["Q"] = new connector();
    }


    //Calculation Functions\\
    evaluate(bitStream) {
        let previousOutputs = JSON.parse(JSON.stringify(this._outputs));
        this._outputs["Q"].value = bitStream[this._startBit];
        return (this._outputs != previousOutputs)
    }
}