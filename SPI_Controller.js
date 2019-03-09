let debugMode = false;

let Gpio;
let max_io;
let CE0;
let CE1;
let SCLK;
let MOSI;
let MISO;

function clock() {
    SCLK.writeSync(1);
    SCLK.writeSync(0);
    //if (debugMode) { console.log("Clocked"); }
}

function latch(io) {
    if (io == "input") {
        CE1.writeSync(1);
        CE1.writeSync(0);
        if (debugMode) { console.log("Input Latched"); }
    } else if (io == "output") {
        CE0.writeSync(1);
        CE0.writeSync(0);
        if (debugMode) { console.log("Output Latched"); }
    }
}


function setup(opt) {
    if (!debugMode) {
        Gpio = require('onoff').Gpio;
    } else {
        Gpio = { //This is a mock GPIO library so that the code will still work outside of a raspberry pi. This is used for debugging.
            writeSync: () => {},
            unexport: () => {},
            watch: () => {},
            readSync: () => {
                let y = Math.random();
                if (y < 0.5) {
                    y = Math.floor(y)
                } else {
                    y = Math.ceil(y)
                }
                return y;
            }
        }
    }
    //Start Declare Pins here
    if (!debugMode) {
        CE0 = new Gpio((opt.chip_select_1 || 8), 'out');
        CE1 = new Gpio((opt.chip_select_2 || 7), 'out');
        SCLK = new Gpio((opt.serial_clock || 11), 'out');
        MOSI = new Gpio((opt.serial_out || 10), 'out');
        MISO = new Gpio((opt.serial_in || 9), 'in', 'both');
    } else {
        CE0 = Gpio;
        CE1 = Gpio;
        SCLK = Gpio;
        MOSI = Gpio;
        MISO = Gpio;
    }
    max_io = opt.max_io || 100;
    if (debugMode) { console.log("Starting SPI") }
}

function read() {
    let data = [];
    latch("input");
    for (let x = 0; x < max_io; x++) {
        clock();
        data[x] = MISO.readSync();
    }
    clock();
    if (debugMode) { console.log("Read " + JSON.stringify(data)); }
    return data;
}

function write(data) {
    for (let x = 0; x < max_io; x++) {
        MOSI.writeSync(data[x]);
        clock();
    }
    MOSI.writeSync(0);
    if (debugMode) { console.log("Wrote " + JSON.stringify(data)); }
    latch("output");
}

function halt() {
    if (debugMode) { console.log("Halting SPI") }
    return "remove all of the pins here";
}




module.exports = {
    setup,
    read,
    write,
    halt,

    get debugMode() {
        return debugMode;
    },

    set debugMode(tf) {
        if (tf) {
            debugMode = true;
            console.log("SPI Debug Mode Activated!");
        } else {
            debugMode = false;
        }
    },
}