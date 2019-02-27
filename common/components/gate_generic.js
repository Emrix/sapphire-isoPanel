require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "gate";
        this._type = "generic";

        //Set Up Inputs\\
        this._inputs["A"] = -1;

        //Set Up Outputs\\
        this._outputs["Q"] = new connector(-1);

        //Set Up Memory\\
        this._memory["mem"] = 1;
    }

    //Calculation Functions\\
    evaluate() {
        let previousOutputs = JSON.parse(JSON.stringify(this._outputs));
        this._outputs["Q"].value = this._inputs["A"] && this._memory["mem"];
        return (this._outputs != previousOutputs)
    }
}