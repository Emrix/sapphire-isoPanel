/*slider.oninput = function() {
    output.innerHTML = this.value;
}
*/

function updateAspectRatio(x, y) {
    const maxPanelWidth = 1000; //Probably will change laters
    let panelContainment = document.getElementById("panelContainment");
    //Do some validations for the numbers
    if (isNaN(x)) {
        x = 1;
    }
    if (isNaN(y)) {
        y = 1;
    }
    //Reduce the fractions so they are in the simplest terms
    let reducedVars = [];

    function reduce(numerator, denominator) {
        let gcd = function gcd(a, b) {
            return b ? gcd(b, a % b) : a;
        };
        if (numerator > denominator) {
            gcd = gcd(numerator, denominator);
        } else { //numerator < denominator
            gcd = gcd(denominator, numerator);
        }
        return [numerator / gcd, denominator / gcd];
    }
    reducedVars = reduce(x, y);
    x = reducedVars[0];
    y = reducedVars[1];
    //Put the updated vars into the fields
    document.getElementById("aspectRatioX").value = x;
    document.getElementById("aspectRatioY").value = y;
    //Adjust the size of the input area
    if (x >= y) {
        //The width will be longer than or equal to the height
        panelContainment.style.width = (maxPanelWidth + "px");
        panelContainment.style.height = (Math.round(maxPanelWidth * y / x) + "px");
    } else {
        panelContainment.style.height = (maxPanelWidth + "px");
        panelContainment.style.width = (Math.round(maxPanelWidth * x / y) + "px");
    }

}

updateAspectRatio(document.getElementById("aspectRatioX").value, document.getElementById("aspectRatioY").value)


// base canvas
var svg = document.getElementById("svg");
svg.ns = svg.namespaceURI;

var mouse = {
    currentOutput: null,
    createPath: function(a, b) {
        var diff = {
            x: b.x - a.x,
            y: b.y - a.y
        };

        var pathStr = "M" + (a.x - 20) + "," + a.y + " ";
        pathStr += "C";
        pathStr += a.x + diff.x / 3 * 2 + "," + a.y + " ";
        pathStr += a.x + diff.x / 3 + "," + b.y + " ";
        pathStr += b.x + "," + b.y;

        return pathStr;
    }
};

window.onmousemove = function(e) {
    if (mouse.currentOutput) {
        var p = mouse.currentOutput.path;
        var iP = mouse.currentOutput.getAttachPoint();
        var oP = { x: e.pageX, y: e.pageY };
        var s = mouse.createPath(iP, oP);
        p.setAttributeNS(null, "d", s);
    }
};

window.onclick = function(e) {
    if (mouse.currentOutput) {
        mouse.currentOutput.path.removeAttribute("d");
        if (mouse.currentOutput.node) {
            mouse.currentOutput.node.detachOutput(mouse.currentOutput);
        }
        mouse.currentOutput = null;
    }
};

function GetFullOffset(element) {
    var offset = {
        top: element.offsetTop,
        left: element.offsetLeft
    };

    if (element.offsetParent) {
        var po = GetFullOffset(element.offsetParent);
        offset.top += po.top;
        offset.left += po.left;
        return offset;
    } else return offset;
}

function Node(name, UUID) {
    // DOM Element creation
    this.domElement = document.createElement("div");
    this.domElement.classList.add("node");
    this.domElement.setAttribute("title", name);

    // Create input visual
    var outDom = document.createElement("span");
    outDom.classList.add("input");
    outDom.innerHTML = "&nbsp;";
    this.domElement.appendChild(outDom);

    // Input Click handler
    var that = this;
    outDom.onclick = function(e) {
        if (mouse.currentOutput && !that.ownsOutput(mouse.currentOutput)) {
            var tmp = mouse.currentOutput;
            mouse.currentOutput = null;
            that.connectTo(tmp);
        }
        e.stopPropagation();
    };

    // Node Stuffs
    this.value = "";
    this.outputs = [];
    this.connected = false;
    this.UUID = UUID;

    // SVG Connectors
    this.attachedPaths = [];
}

function NodeOutput(name) {
    this.name = name;
    this.node = null;

    // setup the varying output types
    this.domElement = document.createElement("div");
    this.domElement.innerHTML = name;
    this.domElement.classList.add("connection");
    this.domElement.classList.add("empty");

    // svg link
    this.path = document.createElementNS(svg.ns, "path");
    this.path.setAttributeNS(null, "stroke", "#8e8e8e");
    this.path.setAttributeNS(null, "stroke-width", "2");
    this.path.setAttributeNS(null, "fill", "none");
    svg.appendChild(this.path);

    // DOM Event handlers
    var that = this;
    this.domElement.onclick = function(e) {
        if (mouse.currentOutput) {
            if (mouse.currentOutput.path.hasAttribute("d"))
                mouse.currentOutput.path.removeAttribute("d");
            if (mouse.currentOutput.node) {
                mouse.currentOutput.node.detachOutput(mouse.currentOutput);
                mouse.currentOutput.node = null;
            }
        }
        mouse.currentOutput = that;
        if (that.node) {
            that.node.detachOutput(that);
            that.domElement.classList.remove("filled");
            that.domElement.classList.add("empty");
        }
        e.stopPropagation();
    };
}

NodeOutput.prototype.getAttachPoint = function() {
    var offset = GetFullOffset(this.domElement);
    return {
        x: offset.left + this.domElement.offsetWidth - 2,
        y: offset.top + this.domElement.offsetHeight / 2
    };
};

Node.prototype.getInputPoint = function() {
    var tmp = this.domElement.firstElementChild;
    var offset = GetFullOffset(tmp);
    return {
        x: offset.left + tmp.offsetWidth / 2,
        y: offset.top + tmp.offsetHeight / 2
    };
};

Node.prototype.addOutput = function(name) {
    var output = new NodeOutput(name);
    this.outputs.push(output);
    this.domElement.appendChild(output.domElement);

    return output;
};

Node.prototype.detachOutput = function(output) {
    var index = -1;
    for (var i = 0; i < this.attachedPaths.length; i++) {
        if (this.attachedPaths[i].output == output) index = i;
    }

    if (index >= 0) {
        this.attachedPaths[index].path.removeAttribute("d");
        this.attachedPaths[index].output.node = null;
        this.attachedPaths.splice(index, 1);
    }

    if (this.attachedPaths.length <= 0) {
        this.domElement.classList.remove("connected");
    }
};

Node.prototype.ownsOutput = function(output) {
    for (var i = 0; i < this.outputs.length; i++) {
        if (this.outputs[i] == output) return true;
    }
    return false;
};

Node.prototype.updatePosition = function() {
    var outPoint = this.getInputPoint();

    var aPaths = this.attachedPaths;
    for (var i = 0; i < aPaths.length; i++) {
        var outputPoint = aPaths[i].output.getAttachPoint();
        var pathStr = this.createPath(outputPoint, outPoint);
        aPaths[i].path.setAttributeNS(null, "d", pathStr);
    }

    for (var j = 0; j < this.outputs.length; j++) {
        if (this.outputs[j].node != null) {
            var iP = this.outputs[j].getAttachPoint();
            var oP = this.outputs[j].node.getInputPoint();

            var pStr = this.createPath(iP, oP);
            this.outputs[j].path.setAttributeNS(null, "d", pStr);
        }
    }
};

Node.prototype.createPath = function(a, b) {
    var diff = {
        x: b.x - a.x,
        y: b.y - a.y
    };

    var pathStr = "M" + (a.x - 20) + "," + a.y + " ";
    pathStr += "C";
    pathStr += a.x + diff.x / 3 * 2 + "," + a.y + " ";
    pathStr += a.x + diff.x / 3 + "," + b.y + " ";
    pathStr += b.x + "," + b.y;

    return pathStr;
};

var meh = 0;
Node.prototype.connectTo = function(output) {
    output.node = this;
    this.connected = true;
    this.domElement.classList.add("connected");

    output.domElement.classList.remove("empty");
    output.domElement.classList.add("filled");

    this.attachedPaths.push({
        output: output,
        path: output.path
    });

    var outputPoint = output.getAttachPoint();
    var inputPoint = this.getInputPoint();

    var pathStr = this.createPath(outputPoint, inputPoint);

    output.path.setAttributeNS(null, "d", pathStr);
};

Node.prototype.moveTo = function(point) {
    this.domElement.style.top = point.y + "px";
    this.domElement.style.left = point.x + "px";
    this.updatePosition();
};

Node.prototype.initUI = function() {
    var that = this;


    // Make draggable
    $(this.domElement).draggable({
        //containment: "body",
        containment: "#panelContainment",
        cancel: ".connection,.input",
        scroll: false,
        drag: function(event, ui) {
            that.updatePosition();
        }
    });
    // Fix positioning
    this.domElement.style.position = "absolute";

    document.getElementById("panelContainment").appendChild(this.domElement);
    //document.body.appendChild(this.domElement);

    // update.
    this.updatePosition();
};




/*Creating the nodes here*/
// Test nodes.
var node01 = new Node("Generate Cube");
node01.addOutput("Name");
node01.addOutput("Size");

var node02 = new Node("Add Maybe");
node02.addOutput("Left");
node02.addOutput("Right");

var node03 = new Node("Translate");
node03.addOutput("Object");
node03.addOutput("X");
node03.addOutput("Y");
node03.addOutput("Z");

// Move and connect.
node01.moveTo({ x: 100, y: 100 });
node02.moveTo({ x: 0, y: 0 });
node03.moveTo({ x: 100, y: 200 });
node01.connectTo(node02.outputs[0]);
node03.connectTo(node02.outputs[1]);

// Add to canvas
node01.initUI();
node02.initUI();
node03.initUI();



function componentSelect() {
    let component = document.getElementById("componentSelector").value; //get the component option name
    let data = [];
    switch (component) {
        case "EMITTER":
            data = ["emitter"];
            break;
        case "DRIVER":
            data = ["constant", "toggle"];
            break;
        case "GATE":
            data = ["NOT", "AND", "OR", "NAND", "NOR", "XOR", "XNOR", "BUFF", "P-IN", "P-OUT", "ADD", "SUB", "MULT", "DIV", "MOD", "LOG", "SIN", "COS", "TAN", "ROUND", "CEIL", "FLOOR"];
            break;
        case "SPECIAL":
            data = [];
            break;
    }
    var list = document.getElementById("typeSelector");
    while (list.children.length > 0) {
        //    for (i = list.children.length; i > 0; i--) {
        list.removeChild(list.childNodes[0]);
    }
    for (i = 0; i < data.length; i += 1) {
        var optionName = data[i]
        var z = document.createElement("option"); //Create the option
        z.setAttribute("value", optionName); //set the value
        var t = document.createTextNode(optionName);
        z.appendChild(t);
        document.getElementById("typeSelector").appendChild(z);
    }
}

function typeSelect() {
    //let component = document.getElementById("componentSelector").value; //get the component option name
    //let type = document.getElementById("typeSelector").value; //get the type option name
}

function addNewPart(GUID, partInfo) {
    let component = document.getElementById("componentSelector").value; //get the component option name
    let type = document.getElementById("typeSelector").value; //get the type option name

    var newNode = new Node(type);
    switch (component) {
        case "EMITTER":
    newNode.addOutput("eName");
    newNode.addOutput("eSize");
            break;
        case "DRIVER":
    newNode.addOutput("dName");
    newNode.addOutput("dSize");
            break;
        case "GATE":
    newNode.addOutput("gName");
    newNode.addOutput("gSize");
            break;
        case "SPECIAL":
    newNode.addOutput("sName");
    newNode.addOutput("sSize");
            break;
    }
    newNode.moveTo({ x: 100, y: 100 });
    newNode.initUI();
}

$.get(
    "configList",
    function(data) {
        data = JSON.parse(data);
        var list = document.getElementById("configurationSelector");
        while (list.children.length > 0) {
            //    for (i = list.children.length; i > 0; i--) {
            list.removeChild(list.childNodes[0]);
        }
        for (i = 0; i < data.length; i += 1) {
            var optionName = data[i]
            var z = document.createElement("option"); //Create the option
            z.setAttribute("value", optionName); //set the value
            var t = document.createTextNode(optionName);
            z.appendChild(t);
            document.getElementById("configurationSelector").appendChild(z);
        }
    }
);

function loadNewConfig(configFile) {
    if (!configFile) {
        configFile = "default.json";
    }
    $.post(
        ("loadConfig?" + configFile),
        function(data) {
            for (x in data.circuit) {
                addNewPart(x, data.circuit[x]);
            }
            //TODO: parse through the config file, and get everything needed.
        }
    );
}

loadNewConfig();