let configFile = "new_test";
let inputs = [];


//Start Libraries
let fs = require('fs');
//End Libraries
let logic_simulator = require("./logic_simulator.js");
var spi = require('./SPI_Controller.js');

spi.debugMode = true;
spi.setup({
    "chip_select_1": 8,
    "chip_select_2": 7,
    "serial_clock": 11,
    "serial_out": 10,
    "serial_in": 9,
    "max_io": 16
});

fs.readFile((__dirname + '/circuits/' + configFile + ".json"), { encoding: 'utf-8' }, function(err, circuit) {
    circuit = JSON.parse(circuit);
    inputs = spi.read();
    logic_simulator.debugMode = true;
    let outputs = logic_simulator.run(circuit, inputs);
    spi.write(outputs);
    spi.halt();
});




//Start Listening for Control - C
if (false) {
    process.on('let', function() {
        unexportOnClose();
        process.exit(); //exit completely
    }); //function to run when user closes using ctrl+c
}
//End Listening for Control - C
