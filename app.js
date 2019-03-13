var http = require('http');
var fs = require('fs');



//create a server object:
http.createServer(function(req, res) {
    fs.readFile((__dirname + '/circuits/index.html'), { encoding: 'utf-8' }, function(err, data) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.write('Server Error'); //write a response to the client
            res.end(); //end the response
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data); //write a response to the client
            fs.readFile((__dirname + '/circuits/index.html'), { encoding: 'utf-8' }, function(err, data) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.write('Server Error'); //write a response to the client
                    res.end(); //end the response
                } else {

                }
            });
            res.end(); //end the response
        }
    });
}).listen(8080); //the server object listens on port 8080