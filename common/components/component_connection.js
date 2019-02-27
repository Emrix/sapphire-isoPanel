module.exports = class {
    constructor() {
        this._value = -1;
        this._tocomponent = "";
        this._toConnector = "";
    }

    get value() { return this._value; }
    set value(_value) { this._value = _value; }

    get toComponent() { return this._tocomponent; }
    set toComponent(UUID) { this._tocomponent = UUID; }

    get toConnector() { return this._toConnector; }
    set toConnector(connectorName) { this._toConnector = connectorName; }
}