require("./component_container");
var connector = require("./component_connection");

module.exports = class extends(require('./component_container.js')) {
    constructor(objectValues) {
        super(objectValues);
        this._componentClass = "gate";
        this._type = "XNOR";

        //Set Up Inputs\\
        this._inputs["A"] = -1;
        this._inputs["B"] = -1;

        //Set Up Outputs\\
        this._outputs["Q"] = new connector(-1);
    }

    //Calculation Functions\\
    evaluate() {
        let previousOutputs = JSON.parse(JSON.stringify(this._outputs));

        var result = 1;
        var hasAnX = false;
        for (let connector in this._inputs) {
            let element = parseInt(this._inputs[connector]);
            if (element === -1) {
                hasAnX = true;
            }
            if (element > .5) {
                result++;
            }
        };
        if (hasAnX) {
            result = -1;
        } else {
            result = result % 2;
        }
        this._outputs["Q"].value = result;

        return (this._outputs != previousOutputs)
    }
}