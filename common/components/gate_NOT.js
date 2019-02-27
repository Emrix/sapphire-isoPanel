require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "gate";
        this._type = "NOT";

        //Set Up Inputs\\
        this._inputs["A"] = -1;

        //Set Up Outputs\\
        this._outputs["Q"] = new connector(-1);
    }

    //Calculation Functions\\
    evaluate() {
        let previousOutputs = JSON.parse(JSON.stringify(this._outputs));
        if (this._inputs["A"] === -1) {
            this._outputs["Q"].value = -1;
        } else {
            this._outputs["Q"].value = Math.round(this._inputs["A"]) > .5 ? 0 : 1;
        }
        return (this._outputs != previousOutputs)
    }
}