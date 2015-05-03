var text = "Notifying subscribers.. "

var seconds = 15;

function makeCoffee(){
	var interval = setInterval(function () {
		seconds--;
		document.getElementById("innerText").innerHTML = text + seconds+"sec";
		if(seconds == 0){
			clearInterval(interval);
			
			document.getElementById("innerText").innerHTML = "Applicants found!"
		}
	}, 1000);
	
	document.getElementById("innerText").innerHTML = text;
}

document.getElementById("coffeeButton").addEventListener("click", makeCoffee);
