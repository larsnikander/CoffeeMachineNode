
function addSensor(){
	var result = "Hello world";
	var form = document.createElement("FORM");
	form.method = "post";
	form.id ="config_form";
	var br = document.createElement("br");

	var number = document.forms.length;

	var title = document.createElement("H3");
	title.innerHTML = "Sensor " + number;
	form.appendChild(title);

	var input = document.createElement("INPUT");
	input.type = "hidden";
	input.name = "sensor_number";
	input.value = number;
	form.appendChild(input);
	
	//Interface
	form.appendChild(document.createTextNode("Interface:"));
	form.appendChild(document.createElement("br"));
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="interface";
	input.value = "";
	form.appendChild(input);
	form.appendChild(document.createElement("br"));


	//Url
	form.appendChild(document.createTextNode("URL:"));
	form.appendChild(document.createElement("br"));
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="url";
	input.value = "";
	form.appendChild(input);
	form.appendChild(document.createElement("br"));

	//Body
	form.appendChild(document.createTextNode("Body:"));
	form.appendChild(document.createElement("br"));
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="body.access_token.key";
	input.value = "access_token";
	form.appendChild(input);
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="body.access_token.value";
	input.value = "";
	form.appendChild(input);
	form.appendChild(document.createElement("br"));
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="body.params.key";
	input.value = "params";
	form.appendChild(input);
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="body.params.value";
	input.value = "";
	form.appendChild(input);
	form.appendChild(document.createElement("br"));

	form.appendChild(document.createElement("br"));
	var b = document.createElement("B");
	b.innerHTML = "Program for Sensor " + number;
	form.appendChild(b);
	form.appendChild(document.createElement("br"));

	//Pin
	form.appendChild(document.createTextNode("Pin:"));
	form.appendChild(document.createElement("br"));
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="program.pin";
	input.value = "";
	form.appendChild(input);
	form.appendChild(document.createElement("br"));

	//Thresshold
	form.appendChild(document.createTextNode("Thresshold:"));
	form.appendChild(document.createElement("br"));
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="program.thresshold";
	input.value = "";
	form.appendChild(input);
	form.appendChild(document.createElement("br"));

	//Activation
	form.appendChild(document.createTextNode("Activation:"));
	form.appendChild(document.createElement("br"));
	var select = document.createElement("SELECT");
	select.name ="program.activation";
	var option = document.createElement("OPTION");
	option.value="l";
	option.innerHTML = "Lower";
	select.appendChild(option);
	var option = document.createElement("OPTION");
	option.value="h";
	option.innerHTML = "Higher";
	select.appendChild(option);
	form.appendChild(select);
	form.appendChild(document.createElement("br"));


	//Entry
	form.appendChild(document.createTextNode("Entry:"));
	form.appendChild(document.createElement("br"));
	var select = document.createElement("SELECT");
	select.name ="program.entry";
	var option = document.createElement("OPTION");
	option.value="operating_start";
	option.innerHTML = "Start of operation";
	select.appendChild(option);
	var option = document.createElement("OPTION");
	option.value="index";
	option.innerHTML = "Start of webpage";
	select.appendChild(option);
	form.appendChild(select);
	form.appendChild(document.createElement("br"));

	//Reaction
	form.appendChild(document.createTextNode("Reaction:"));
	form.appendChild(document.createElement("br"));
	var select = document.createElement("SELECT");
	select.name ="program.reaction";
	var option = document.createElement("OPTION");
	option.value="broadcast";
	option.innerHTML = "Broadcast to subscribers";
	select.appendChild(option);
	var option = document.createElement("OPTION");
	option.value="show";
	option.innerHTML = "Show value on webpage";
	select.appendChild(option);
	form.appendChild(select);
	form.appendChild(document.createElement("br"));

	//Extras
	form.appendChild(document.createTextNode("Extras:"));
	form.appendChild(document.createElement("br"));
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="program.extras";
	input.value = "queue";
	form.appendChild(input);
	form.appendChild(document.createElement("br"));


	//Description
	form.appendChild(document.createTextNode("Description:"));
	form.appendChild(document.createElement("br"));
	var input = document.createElement("INPUT");
	input.type = "text";
	input.name ="program.description";
	input.value = "";
	form.appendChild(input);
	form.appendChild(document.createElement("br"));


	//Description
	var input = document.createElement("INPUT");
	input.type = "checkbox";
	input.name ="remove";
	form.appendChild(input);
	form.appendChild(document.createTextNode("Remove sensor."));
	form.appendChild(document.createElement("br"));

	var submitButton = document.createElement("input");
	submitButton.type = "submit";
	submitButton.value = "Update this sensor";
	form.appendChild(submitButton);
	document.getElementById("description").appendChild(form);
	

}

document.getElementById("sensorButton").addEventListener("click", addSensor);
