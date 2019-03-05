if (isAPi) {
    var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
} else {
    var Gpio = { //This is a mock GPIO library so that the code will still work outside of a raspberry pi. This is used for debugging.
        writeSync: () => {},
        unexport: () => {},
        watch: () => {},
        readSync: () => {
            return 1;
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

//Start Declare Pins here
if (isAPi) {
    var CE0 = new Gpio(8, 'out');
    var CE1 = new Gpio(7, 'out');
    var SCLK = new Gpio(11, 'out');
    var MOSI = new Gpio(10, 'out');
    var MISO = new Gpio(9, 'in', 'both');
} else {
    var CE0 = Gpio;
    var CE1 = Gpio;
    var SCLK = Gpio;
    var MOSI = Gpio;
    var MISO = Gpio;
}
var outputPins = [CE0, CE1, SCLK, MOSI];
var inputPins = [MISO];
//End declaring pins

//Start Declare Variables
const MAX_IO = 100;
var SPIbitOutputs = [];
var SPIbitInputs = [];

var debugMode = true;
var isAPi = false;
//End Declare Variables



if (debugMode) console.log("Latch");
//Start running the poller
//Pulse the latch
CE0.writeSync(1);
CE0.writeSync(0);
if (debugMode) console.log("Shift in a specified number of bits and into an array");
for (var x = 0; x < MAX_IO; x++) {
    //Clock tick
    SCLK.writeSync(1);
    SCLK.writeSync(0);
    //Read input
    SPIbitInputs[x] = MISO.readSync();
}
if (debugMode) {
    var outputString = "";
    for (var x = 0; x < MAX_IO; x++) {
        outputString += ("Input " + x + " = " + SPIbitInputs[x] + "\t");
    }
    //console.log(outputString);
};
//End running the poller


//Latch
if (debugMode) console.log("Latch");
//Start running the poller
//Pulse the latch
CE1.writeSync(1);
CE1.writeSync(0);


//Load the SPI outputs into the system
if (debugMode) console.log("Shift in a specified number of bits and into an array");
for (var x = 0; x < MAX_IO; x++) {
    //Write Output
    MOSI.writeSync(SPIbitOutputs[x])
    //Clock tick
    SCLK.writeSync(1);
    SCLK.writeSync(0);
}
if (debugMode) {
    var outputString = "";
    for (var x = 0; x < MAX_IO; x++) {
        outputString += ("Output " + x + " = " + SPIbitOutputs[x] + "\t");
    }
    //console.log(outputString);
};
//End running the poller


//Start Listening for Control - C
if (isAPi) {
    process.on('SIGINT', function() {
        unexportOnClose();
        process.exit(); //exit completely
    }); //function to run when user closes using ctrl+c
}
//End Listening for Control - C