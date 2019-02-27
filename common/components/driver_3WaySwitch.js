require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "driver";
        this._type = "3 Way Switch";

        this._bitLength = 2;

        //Set Up Outputs\\
        this._outputs["Q0"] = new connector();
        this._outputs["Q1"] = new connector();
    }


    //Calculation Functions\\
    evaluate(bitStream) {
        let previousOutputs = JSON.parse(JSON.stringify(this._outputs));
        this._outputs["Q0"].value = bitStream[this._startBit];
        this._outputs["Q1"].value = bitStream[this._startBit+1];
        return (this._outputs != previousOutputs)
    }
}