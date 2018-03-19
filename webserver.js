//Libraries
var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('pigpio').Gpio; //include onoff to interact with the GPIO
//End Libraries





//Declare Pins here
var LED = new Gpio(4, {
    mode: Gpio.OUTPUT
}); //use GPIO pin 4 as output

var pushButton = new Gpio(17, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
}); //use GPIO pin 17 as input
//End declaring pins





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
//END SERVER INFO





//Thorium
//End Thorium





//Serial
//End Serial





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
        lightvalue = value; //Do GPIO or Serial Functions Here
        socket.emit('light', lightvalue); //send button status to client
        //Send GPIO stuffs
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
process.on('SIGINT', function() { //on ctrl+c
    LED.digitalWrite(0); // Turn LED off
    process.exit(); //exit completely
});
//End Clean up