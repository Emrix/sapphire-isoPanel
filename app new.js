var fs = require('fs');

const hardwareSize = 8;

let webStream = {};
let thoriumStream = {};
let bitStream = [];

var hardwareIO = new (require('./common/hardware.js'))();
hardwareIO.inputLength = 8;
/* HardwareIO
hardwareIO.inputLength
hardwareIO.values
*/

bitStream = hardwareIO.values;

var logicCircuit = new (require('./common/logicCircuit.js'))();
/*
logicCircuit.loadCircuit(circuitObjectString); //void
logicCircuit.saveCircuit(); //circuitObjectString
logicCircuit.addComponent(componentClass,componentType); //void
logicCircuit.removeComponent(componentUUID); //0 - success, 1 - fail
logicCircuit.evaluateCircuit(bitStream,webStream,thoriumStream); //void
logicCircuit.addConnection(fromComponentUUID,fromConnectorName,toComponentUUID,toConnectorName); //0 - success, 1 - fail
*/



//fs.writeFileSync('./config/test.json', logicCircuit.saveCircuit(),"utf8");

logicCircuit.loadCircuit(fs.readFileSync('./config/generic_example.json',"utf8"));



bitStream = [0,0]
console.log(bitStream)
bitStream = logicCircuit.evaluateCircuit(bitStream, webStream, thoriumStream);
console.log(bitStream);
console.log("--------");
