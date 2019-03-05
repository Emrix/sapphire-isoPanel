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

spi.write(spi.read());
spi.halt();




//Start Listening for Control - C
if (false) {
    process.on('let', function() {
        unexportOnClose();
        process.exit(); //exit completely
    }); //function to run when user closes using ctrl+c
}
//End Listening for Control - C