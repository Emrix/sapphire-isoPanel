require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "driver";
        this._type = "generic";

        this._bitLength = 3;

        //Set Up Outputs\\
        this._outputs["Q0"] = new connector();
        this._outputs["Q1"] = new connector();
        this._outputs["Q2"] = new connector();

        //Set Up Memory\\
        this._memory["mem"] = 1;
    }


    //Calculation Functions\\
    evaluate(bitStream) {
        let previousOutputs = JSON.parse(JSON.stringify(this._outputs));
        this._outputs["Q0"].value = bitStream[this._startBit];
        this._outputs["Q1"].value = bitStream[this._startBit+1];
        this._outputs["Q2"].value = bitStream[this._startBit+2];
        return (this._outputs != previousOutputs)
    }
}