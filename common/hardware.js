module.exports = class {
    constructor() {
        this.sipo = require('./sipo.js');
        this.piso = require('./piso.js');

        const isAPi = false;

        if (isAPi) {
            var Gpio = require('onoff').Gpio;
        } else {
            /*
            This is a mock GPIO object so that the code will still
            run outside of a raspberry pi. This is used for debugging
            */
            var Gpio = class {
                constructor() {}
                writeSync() {}
                unexport() {}
                watch() {}
                readSync() {
                    var y = Math.random();
                    if (y < 0.5) {
                        y = Math.floor(y)
                    } else {
                        y = Math.ceil(y)
                    }
                    return y;
                    //return 0;
                }
            }
        }
        this.CE0 = new Gpio(8, 'out');
        this.CE1 = new Gpio(7, 'out');
        this.SCLK = new Gpio(11, 'out');
        this.MOSI = new Gpio(10, 'out');
        this.MISO = new Gpio(9, 'in', 'both');
        this.PWR = new Gpio(3, 'in', 'both');
    }

    get inputLength() { return this._inputLength; }
    set inputLength(inputLength) { this._inputLength = inputLength; }

    get values() { return this.piso(this.SCLK, this.CE1, this.MISO, this._inputLength); }
    set values(bitStream) { this.sipo(this.SCLK, this.CE0, this.MOSI, bitStream); }
}