let debugMode = false;

let lcdData = [];

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
    number_of_LCDs = (opt.number_of_LCDs || 3);
    //Start Declare Pins here
    if (!debugMode) {
        lcd_clock = new Gpio((opt.lcd_clock || 25), 'out');
        serial_out = new Gpio((opt.serial_out || 2), 'out');
        dBusR = new Gpio((opt.dBusR || 4), 'in', 'both');
        dBus0 = new Gpio((opt.dBus0 || 14), 'out');
        dBus1 = new Gpio((opt.dBus1 || 15), 'out');
        dBus2 = new Gpio((opt.dBus2 || 17), 'out');
        dBus3 = new Gpio((opt.dBus3 || 18), 'out');
        dBus4 = new Gpio((opt.dBus4 || 27), 'in', 'both');
        dBus5 = new Gpio((opt.dBus5 || 22), 'out');
        dBus6 = new Gpio((opt.dBus6 || 23), 'out');
        dBus7 = new Gpio((opt.dBus7 || 24), 'in', 'both');
    } else {
        lcd_clock = Gpio;
        serial_out = Gpio;
        dBusR = Gpio;
        dBus0 = Gpio;
        dBus1 = Gpio;
        dBus2 = Gpio;
        dBus3 = Gpio;
        dBus4 = Gpio;
        dBus5 = Gpio;
        dBus6 = Gpio;
        dBus7 = Gpio;
    }
    if (debugMode) { console.log("Starting SPI") }
    for (let x = 0; x < number_of_LCDs; x++) {
        lcdData[x] = [];
        for (let y = 0; y < 2; y++) {
            lcdData[x][y] = [];
            for (let z = 0; z < 16; z++) {
                lcdData[x][y][z] = ' ';
            }
        }
    }
    writeBus(resetSequence[6]);
    resetLCDs();
}

function commit() {
    //Switch to first line
    writeBus(firstLine);
    startPulse();
    for (let LCDNum = 0; LCDNum < number_of_LCDs; LCDNum++) {
        clock();
    }
    //Write First Line
    for (let charNum = 0; charNum < 16; charNum++) {
        startPulse();
        for (let lcdNum = 0; lcdNum < number_of_LCDs; lcdNum++) {
            //console.log(lcdData[lcdNum][0][charNum].charCodeAt(0));
            writeBus(lookup[
                lcdData[lcdNum][0][charNum].charCodeAt(0)
            ]);
            clock();
        }
    }
    //Switch to next line
    writeBus(nextLine);
    startPulse();
    for (let LCDNum = 0; LCDNum < number_of_LCDs; LCDNum++) {
        clock();
    }
    //Write 2nd Line
    for (let charNum = 0; charNum < 16; charNum++) {
        startPulse();
        for (let lcdNum = 0; lcdNum < number_of_LCDs; lcdNum++) {
            writeBus(lookup[
                lcdData[lcdNum][1][charNum].charCodeAt(0)
            ]);
            clock();
        }
    }
}

function set(data) {
    for (let x = 0; x < 16; x++) {
        lcdData[data.lcd - 1][data.line - 1][x] = data.message[x];
    }
}

function halt() {
    if (debugMode) { console.log("Halting SPI") }
    return "remove all of the pins here";
}

function writeBus(data) {
    for (let x = 0; x < 9; x++) {
        dBusR.writeSync(data[0]);
        dBus7.writeSync(data[1]);
        dBus6.writeSync(data[2]);
        dBus5.writeSync(data[3]);
        dBus4.writeSync(data[4]);
        dBus3.writeSync(data[5]);
        dBus2.writeSync(data[6]);
        dBus1.writeSync(data[7]);
        dBus0.writeSync(data[8]);
    }
}

function resetLCDs() {
    for (let resetStep = 0; resetStep < 7; resetStep++) {
        writeBus(resetSequence[resetStep]);
        startPulse();
        for (let LCDNum = 0; LCDNum < number_of_LCDs; LCDNum++) {
            clock();
        }
    }
    for (let x = 0; x < number_of_LCDs; x++) {
        for (let y = 0; y < 2; y++) {
            for (let z = 0; z < 16; z++) {
                lcdData[x][y][z] = ' ';
            }
        }
    }
}

function startPulse() {
    serial_out.writeSync(1);
    clock();
    serial_out.writeSync(0);
}

module.exports = {
    setup,
    set,
    commit,
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

function clock() {
    lcd_clock.writeSync(1);
    lcd_clock.writeSync(0);
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

let lookup = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 1, 0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 1, 0, 0],
    [1, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 1, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 1, 0],
    [1, 0, 1, 0, 0, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 0],
    [1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 1, 1, 1, 1, 1, 1]
];

let resetSequence = [
    [0, 0, 0, 0, 0, 0, 0, 0, 1], //Clear display
    [0, 0, 0, 0, 0, 0, 0, 1, 0], //Return Home
    [0, 0, 0, 0, 0, 0, 1, 1, 0], //Entry Mode Set
    [0, 0, 0, 0, 0, 1, 1, 0, 0], //Display on/off control
    [0, 0, 0, 0, 1, 0, 1, 0, 0], //Cursor or display shift
    [0, 0, 0, 1, 1, 1, 1, 0, 0], //Function set
    [0, 0, 0, 0, 0, 0, 0, 1, 0] //Return Home
];

let firstLine = [0, 0, 0, 0, 0, 0, 0, 1, 0];
let nextLine = [0, 1, 1, 0, 0, 0, 0, 0, 0];