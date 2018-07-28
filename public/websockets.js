var eventListeners = {};

function addWebSocketListener(GUID) {
	var element = document.getElementById(GUID);
	element.addEventListener("change", function() { //add event listener for when checkbox changes
		socket.emit("IOchange", {
			"component": GUID,
			"value": Number(this.checked) //This might need tp be changed based on the input
		}); //send button status to server (as 1 or 0)
	});
	eventListeners[element] = 1;
}

function removeWebSocketListener(GUID) {
	var element = document.getElementById(GUID);
	element.removeEventListener("change", function() {});
	delete eventListeners[element];
}

var socket = io(); //load socket.io-client and connect to the host that serves the page

//This is the client recieving info from the server
socket.on("IOchange", function(data) { //get button status from server
	console.log("Client got some data!!!");
	console.log(data);
	//This might also need to be changed based on the input / output type
	document.getElementById(data.component).checked = data.value; //change checkbox according to push button on Raspberry Pi
	//socket.emit("IOchange", data); //send push button status to back to server
});