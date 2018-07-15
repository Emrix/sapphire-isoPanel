function addNewPart(GUID, partInfo) {
    var component = partInfo.component;
    var type = partInfo.type;
    console.log(partInfo);
    switch (component) {
        case "emitter":
            switch (type) {
                case "emitter":
                    var list = document.getElementById("outputs");
                    var output = document.createElement("input"); //Create the option
                    output.setAttribute("type", "checkbox"); //set the value
                    output.setAttribute("id", GUID); //set the value
                    output.setAttribute("disabled", "true"); //set the value
                    var label = document.createElement("span"); //Create the option
                    label.innerHTML = partInfo.label;
                    var br = document.createElement("br"); //Create the option
                    list.appendChild(output);
                    list.appendChild(label);
                    list.appendChild(br);
                    break;
            }
            break;
        case "driver":
            var list = document.getElementById("inputs");
            switch (type) {
                case "variable":
                    var input = document.createElement("input"); //Create the option
                    input.setAttribute("type", "range"); //set the value
                    input.setAttribute("id", GUID); //set the value
                    var label = document.createElement("span"); //Create the option
                    label.innerHTML = partInfo.label;
                    var br = document.createElement("br"); //Create the option
                    list.appendChild(input);
                    list.appendChild(label);
                    list.appendChild(br);
                    break;
                case "toggle":
                    var input = document.createElement("input"); //Create the option
                    input.setAttribute("type", "checkbox"); //set the value
                    input.setAttribute("id", GUID); //set the value
                    var label = document.createElement("span"); //Create the option
                    label.innerHTML = partInfo.label;
                    var br = document.createElement("br"); //Create the option
                    list.appendChild(input);
                    list.appendChild(label);
                    list.appendChild(br);
                    break;
            }
            break;
        case "gate":
            break;
        case "special":
            break;
    }
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
            //            console.log(data);
            var list = document.getElementById("inputs");
            while (list.children.length > 0) {
                //    for (i = list.children.length; i > 0; i--) {
                list.removeChild(list.childNodes[0]);
            }
            var list = document.getElementById("outputs");
            while (list.children.length > 0) {
                //    for (i = list.children.length; i > 0; i--) {
                list.removeChild(list.childNodes[0]);
            }
            for (x in data.circuit) {
                addNewPart(x, data.circuit[x]);
            }
            //TODO: parse through the config file, and get everything needed.
        }
    );
}

loadNewConfig();