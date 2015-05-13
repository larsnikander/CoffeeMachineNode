
function updateConfig(){
	document.forms[0].submit();	
	document.getElementById("innerText").innerHTML = "Updating Config Files";
}

document.getElementById("coffeeButton").addEventListener("click", updateConfig);
