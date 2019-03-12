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




var lcd = require('./LCD_SPI_Controller.js');

lcd.debugMode = true;
lcd.setup({
    "number_of_LCDs": 3,
    "lcd_clock": 25,
    "serial_out": 2,
    "dBusR": 4,
    "dBus0": 14,
    "dBus1": 15,
    "dBus2": 17,
    "dBus3": 18,
    "dBus4": 27,
    "dBus5": 22,
    "dBus6": 23,
    "dBus7": 24
});

lcd.set({ "line": 1, "lcd": 1, "message": "0123456789abcdef" });
lcd.set({ "line": 2, "lcd": 1, "message": "First LCD!      " });
lcd.set({ "line": 2, "lcd": 2, "message": "Second LCD!     " });
lcd.set({ "line": 1, "lcd": 2, "message": "123456789abcdef0" });
lcd.set({ "line": 1, "lcd": 3, "message": "Third LCD!      " });
lcd.set({ "line": 2, "lcd": 3, "message": "Power at!@#$%^&*" });
lcd.commit();

lcd.set({ "line": 1, "lcd": 1, "message": "     Power      " });
lcd.set({ "line": 2, "lcd": 1, "message": "  Distribution  " });
lcd.set({ "line": 1, "lcd": 2, "message": "Power Node 1:   " });
lcd.set({ "line": 2, "lcd": 2, "message": "0400 Units/Power" });
lcd.set({ "line": 1, "lcd": 3, "message": "Power Node 2:   " });
lcd.set({ "line": 2, "lcd": 3, "message": "4400 Units/Power" });
lcd.commit();

lcd.halt();


//Start Listening for Control - C
if (false) {
    process.on('let', function() {
        unexportOnClose();
        process.exit(); //exit completely
    }); //function to run when user closes using ctrl+c
}
//End Listening for Control - C