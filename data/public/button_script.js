var text = "Notifying subscribers.. "

var seconds = document.getElementById("seconds").innerHTML;
seconds = (seconds /1000);
var sensors = document.getElementById("sensors").innerHTML;
sensors *= 2;
sensors /= 2;

function makeCoffee(){	
	document.getElementById("coffeeButton").removeEventListener("click", makeCoffee);
	
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
					
					if(response.queue.length == 0){
						document.getElementById("innerText").innerHTML = response.text + "(reloading in 5 seconds)";
						setTimeout('location.reload()',5000);
					} else {									
						if(sensors > 0){
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
						} else {
    						document.getElementById("innerText").innerHTML=response.text + " (press this button when done)";
							document.getElementById("coffeeButton").addEventListener("click",function(){
								var xmlhttp2 = new XMLHttpRequest();
	  							xmlhttp2.onreadystatechange=function(){
									if (xmlhttp2.readyState==4 && xmlhttp2.status==200){
										location.reload();
	    								}
								}
	       						 	xmlhttp2.open("POST","forceStop",true);
	       		 				 	xmlhttp2.send();
								//location.reload();							
							});
						}
					}
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
