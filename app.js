var http = require('http');
var fs = require('fs');

let circuitName = 'new_test'

//create a server object:
http.createServer(function(req, res) {
    switch (req.url) {
        case "/index.css":
            fs.readFile((__dirname + '/public/index.css'), { encoding: 'utf-8' }, function(err, data) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.write('Server Error, error with index.css'); //write a response to the client
                    res.end(); //end the response
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/css' });
                    res.write(data); //write a response to the client
                    res.end(); //end the response
                }
            });
            break;
        case "/index.js":
            fs.readFile((__dirname + '/public/index.js'), { encoding: 'utf-8' }, function(err, data) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.write('Server Error, error with index.js'); //write a response to the client
                    res.end(); //end the response
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/javascript' });
                    res.write(data); //write a response to the client
                    res.end(); //end the response
                }
            });
            break;
        case "/":
        case "/index.html":
            let inputValues = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let outputValues = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            fs.readFile((__dirname + '/public/index.html'), { encoding: 'utf-8' }, function(err, webpage) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.write('Server Error, error with index.html'); //write a response to the client
                    res.end(); //end the response
                } else {
                    fs.readFile((__dirname + '/circuits/' + circuitName + ".json"), { encoding: 'utf-8' }, function(err, circuit) {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/html' });
                            res.write('Server error with ' + circuitName); //write a response to the client
                            res.end(); //end the response
                        } else {
                            try {
                                circuit = JSON.parse(circuit);
                            } catch (vError) {
                                res.writeHead(500, { 'Content-Type': 'text/html' });
                                res.write('Server error: could not decode ' + circuitName); //write a response to the client
                                res.end(); //end the response
                            }
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.write(compilewebpage(webpage, circuit, inputValues, outputValues)); //write a response to the client
                            res.end(); //end the response
                        }
                    });
                }
            });
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write("Error 404\n" + req.url + "\nNot found"); //write a response to the client
            res.end(); //end the response
            break
    }
}).listen(8080); //the server object listens on port 8080

function compilewebpage(webpage, circuit, inputValues, outputValues) {
    let panelInputsForWeb = "";
    let panelOutputsForWeb = "";

    for (let key in circuit.components) {
        if (circuit.components[key].type == "driver") {
            panelInputsForWeb += "<div>";
            for (let x in circuit.components[key].inputs) {
                if (outputValues[circuit.components[key].inputs[x]] == "1") {
                    panelInputsForWeb += "<p class='on'>";
                } else {
                    panelInputsForWeb += "<p class='off'>";
                }
                panelInputsForWeb += circuit.components[key].name + " - " + x + ": " + inputValues[circuit.components[key].inputs[x]];
                panelInputsForWeb += "</p>\n";
            }
            panelInputsForWeb += "</div>\n";
        } else if (circuit.components[key].type == "emitter") {
            panelOutputsForWeb += "<div>";
            for (let x in circuit.components[key].outputs) {
                if (outputValues[circuit.components[key].outputs[x]] == "1") {
                    panelOutputsForWeb += "<p class='on'>";
                } else {
                    panelOutputsForWeb += "<p class='off'>";
                }
                panelOutputsForWeb += circuit.components[key].name + " - " + x + ": " + outputValues[circuit.components[key].outputs[x]];
                panelOutputsForWeb += "</p>\n";
            }
            panelOutputsForWeb += "</div>\n";
        }
    }

    webpage = webpage.replace("#PanelInputs#", panelInputsForWeb);
    webpage = webpage.replace("#PanelOutputs#", panelOutputsForWeb);
    return webpage
}