require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "gate";
        this._type = "replicator";

        //Set Up Inputs\\
        this._inputs["A"] = -1;

        //Set Up Outputs\\
        this._outputs["Q"] = new connector(-1);
        this._outputs["R"] = new connector(-1);
        this._outputs["S"] = new connector(-1);
        this._outputs["T"] = new connector(-1);
    }

    //Calculation Functions\\
    evaluate() {
        let previousOutputs = JSON.parse(JSON.stringify(this._outputs));

        this._outputs["Q"].value = this._inputs["A"];
        this._outputs["R"].value = this._inputs["A"];
        this._outputs["S"].value = this._inputs["A"];
        this._outputs["T"].value = this._inputs["A"];

        return (this._outputs != previousOutputs)
    }
}