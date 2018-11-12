var sipo = require('./common/sipo.js');
var piso = require('./common/piso.js');
//var bit = require('./common/bitfunctions.js');
var component = require('./common/components/component.js');

const isAPi = false;


if (isAPi) {
    var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
} else {
    var Gpio = { //This is a mock GPIO library so that the code will still work outside of a raspberry pi. This is used for debugging.
        writeSync: () => {},
        unexport: () => {},
        watch: () => {},
        readSync: () => {
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

if (isAPi) {
    var CE0 = new Gpio(8, 'out'); //Should be 8
    var CE1 = new Gpio(7, 'out');
    var SCLK = new Gpio(11, 'out');
    var MOSI = new Gpio(10, 'out');
    var MISO = new Gpio(9, 'in', 'both');
    var PWR = new Gpio(23, 'in', 'both');
} else {
    var CE0 = Gpio;
    var CE1 = Gpio;
    var SCLK = Gpio;
    var MOSI = Gpio;
    var MISO = Gpio;
    var PWR = Gpio;
}

/*
SPIbitOutputs = [1,0,1,1,0,1,0,0];

SPIbitOutputs = piso.run(SCLK,CE0,MOSI,8)
console.log(bit.bitToFloat(SPIbitOutputs));


SPIbitOutputs = bit.floatToBit(Math.random(),bit.componentBitSize("DimmableLED"));
sipo.run(SCLK,CE0,MOSI,SPIbitOutputs)
*/

var bitArray = [0,0];

var myComp = new component.circuitComponent("test",1,1,1);
myComp.bitLength = 1;
myComp.setBitValue(bitArray);
console.log(myComp.getBitValue(bitArray));
console.log(myComp.value);

/*
myComp.startBit = 4;

console.log(myComp.label);
console.log(myComp.startBit);




//myComp.value = "Meh123";
console.log(myComp.value); // John

*/