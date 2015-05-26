
function updateConfig(){
	document.forms[0].submit();	
	document.getElementById("innerText").innerHTML = "Updating Config Files";
}

document.getElementById("coffeeButton").addEventListener("click", updateConfig);

var x = document.getElementById("demo");
var pos;
function getLocation() {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(showPosition);
	    } else {
	        x.innerHTML = "Geolocation is not supported by this browser.";
	    }
}

function showPosition(position) {
		pos = position;
		var button = document.createElement("INPUT");
		button.value= "Use current position";
		button.type="button";
		button.addEventListener("click",fillForm);
		x.appendChild(button);
		x.appendChild(document.createTextNode("  ("+pos.coords.latitude+";"+pos.coords.longitude+")"))
}

function fillForm(){
	console.log("filling form");
	lat = document.getElementById("lat");
	lon = document.getElementById("lon");
	lat.value = pos.coords.latitude;
	lon.value = pos.coords.longitude;
};

getLocation();
	