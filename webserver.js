//Libraries
var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
//End Libraries





//Declare Pins here
/*
               74HC595 SIPO                 
Output <=   QB  | 01  16 | Vcc     => 5v    
Output <=   QC  | 02  15 | QA      => Output
Output <=   QD  | 03  14 | SER     => Ser In (MOSI)
Output <=   QE  | 04  13 | OE      => GND   
Output <=   QF  | 05  12 | RCLK    => LOAD
Output <=   QG  | 06  11 | SRCLK   => CLOCK
Output <=   QH  | 07  10 | SRCLR   => 5v    
GND    <=   GND | 08  09 | QH'     => SER Out

                  74HC165 PISO                  
LOAD   <=   SH/LD  | 01  16 | Vcc      => 5v    
CLOCK  <=   CLK    | 02  15 | CLK INH  => GND   
Input  <=   E      | 03  14 | D        => Input 
Input  <=   F      | 04  13 | C        => Input 
Input  <=   G      | 05  12 | B        => Input 
Input  <=   H      | 06  11 | A        => Input 
            QH'    | 07  10 | SER      => SER In
GND    <=   GND    | 08  09 | QH       => SER Out (MISO)

                  Raspberry Pi                  
        3.3v   | 01  02 | 5v
        GPIO2  | 03  04 | 5v
        GPIO3  | 05  06 | GND
     <= GPIO4  | 07  08 | GPIO14 =>
GND  <= GND    | 09  10 | GPIO15 => 
     <= GPIO17 | 11  12 | GPIO18 => 
     <= GPIO27 | 13  14 | GND
     <= GPIO22 | 15  16 | GPIO23 =>
        3.3v   | 17  18 | GPIO24 =>
MOSI <= GPIO10 | 19  20 | GND
MISO <= GPIO9  | 21  22 | GPIO25 => POWER
SCLK <= GPIO11 | 23  24 | GPIO8  => CE0
        GND    | 25  26 | GPIO7  => CE1
------------------------------------
        DNC    | 27  28 | DNC
     <= GPIO5  | 29  30 | GND
     <= GPIO6  | 31  32 | GPIO12 => 
     <= GPIO13 | 33  34 | GND
     <= GPIO19 | 35  36 | GPIO16 => 
     <= GPIO26 | 37  38 | GPIO20 => 
        GND    | 39  40 | GPIO21 => 
*/

var CE0 = new Gpio(4, 'out'); //Should be 8
var CE1 = new Gpio(7, 'out');
var SCLK = new Gpio(11, 'out');
var MOSI = new Gpio(10, 'out');
var MISO = new Gpio(9, 'in', 'both');
var POWER = new Gpio(23, 'in', 'both');
var outputPins = [CE0, CE1, SCLK, MOSI];
var inputPins = [MISO, POWER];
//End declaring pins





//Parse Config File
fs.readFile(__dirname + '/config.json', function(err, data) { //read file config.json
    if (err) {
        return {};
    }

});
//End Parse Config File





//SERVER INFO
http.listen(8080); //listen to port 8080

function handler(req, res) { //create server
    fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' }); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' }); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}
/*Here's an idea, make it so the config files can be configured through the web browser*/
//END SERVER INFO





//Thorium
//End Thorium





//Serial
//End Serial





//Keyboard Input
//End Keyboard Input





//GPIO
function setLightValue(TFlightValue) {
    LED.writeSync(TFlightValue); //turn LED on or off
    //LED.pwmWrite(TFlightValue); //PWM (0-255)
}
//End GPIO





//WebSockets
io.sockets.on('connection', function(socket) { // WebSocket Connection
    var lightvalue = 0; //static variable for current status
    pushButton.watch(function(err, value) { //Watch for hardware interrupts on pushButton
        if (err) { //if an error
            console.error('There was an error', err); //output error message to console
            return;
        }
        lightvalue = value;
        socket.emit('light', lightvalue); //send button status to client
    });
    socket.on('light', function(data) { //get light switch status from client
        lightvalue = data;
        if (lightvalue != LED.readSync()) { //only change LED if status has changed
            setLightValue(lightvalue); //turn LED on or off
        }
    });
});
//End WebSockets





//Clean Up
function unexportOnClose() { //function to run when exiting program
    outputPins.forEach(function(currentValue) { //for each LED
        currentValue.writeSync(0); //turn off LED
        currentValue.unexport(); //unexport GPIO
    });
    inputPins.forEach(function(currentValue) { //for each LED
        currentValue.unexport(); //unexport GPIO to free resources
    });
};

process.on('SIGINT', function() {
    unexportOnClose
    process.exit(); //exit completely
}); //function to run when user closes using ctrl+c
//End Clean up