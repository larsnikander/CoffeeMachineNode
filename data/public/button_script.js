var text = "Notifying subscribers.. "

var seconds = document.getElementById("seconds").innerHTML;
seconds = (seconds /1000);

function makeCoffee(){
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET","startOperation",true);
	xmlhttp.send();
	
	
	var interval = setInterval(function () {
		seconds--;
		
		
		document.getElementById("innerText").innerHTML = text + seconds+"sec";
		if(seconds == 0){
			clearInterval(interval);

			xmlhttp.onreadystatechange=function(){
  				if (xmlhttp.readyState==4 && xmlhttp.status==200){
					var response = JSON.parse(xmlhttp.responseText);
					
    					document.getElementById("innerText").innerHTML=response.text;
					var finishInterval = setInterval(function(){
						var xmlhttp2 = new XMLHttpRequest();
						xmlhttp2.onreadystatechange=function(){
  							if (xmlhttp2.readyState==4 && xmlhttp2.status==200){
    									var response2 = JSON.parse(xmlhttp2.responseText);
									if(response2.state == 3)
										location.reload();
    							}
  						}
       					 	xmlhttp2.open("GET","getState",true);
        				 	xmlhttp2.send();
					},1000);
    				}
			}

			xmlhttp.open("GET","getApplicants",true);
			xmlhttp.send();

			document.getElementById("innerText").innerHTML = "Applicants found!"
		}
	}, 1000);
	
	document.getElementById("innerText").innerHTML = text;
}

document.getElementById("coffeeButton").addEventListener("click", makeCoffee);
