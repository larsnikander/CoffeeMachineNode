/******** Requires ********/
var express = require('express');
var querystring = require('querystring');
var path = require('path');
var app = express();
var bodyParser = require('body-parser')
var fs = require('fs');
var crypto = require('crypto');
var http = require('http');
var https = require('https');
var WebSocketClient = require('websocket').client;

/******** States ********/
var INITIAL = 0;
var UNREGISTERED = 1;
var REGISTERED = 2;
var OPEN_FOR_REQUEST = 3;
var NOTIFYING_SUBSCRIBERS = 4;
var NOTIFY_APPLICANTS = 5;
var OPERATING = 6;

/* 
 *     	   Program Flow
 *
 * INITIAL      	 0|
 * UNREGISTERED 	 1|
 * REGISTERED   	 2|
 * OPEN_FOR_REQUEST	 3|\ 
 * NOTIFYING_SUBSCRIBERS 4|| When OPERATING is done the program will
 * NOTIFYING_APPLICANTS	 5|| return to OPEN_FOR_REQUEST and wait.
 * OPERATING		 6|/ 
 *
 */


/******** Engine Setup ********/

// view engine setup
app.set('views', path.join(__dirname, 'data/view'));
app.set('view engine', 'ejs');

// Use  public folder for jQuery and Style Sheets
app.use(express.static(path.join(__dirname, 'data/public')));

// Put these statements before you define any routes.
app.use(bodyParser.urlencoded());
// Use bodyParser to get bodyData from req's
app.use(bodyParser.json());


/******** Field variables ********/
var openForRequests = false;
var queue = [];
var rejections = [];
var connectionToServer;
var currentRequest;
var state = INITIAL;

/******** Stored variables ********/
var properties = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.properties'), 'utf8'));
var subscribers = JSON.parse(fs.readFileSync(path.join(__dirname, 'subscribers.json'), 'utf8'));
var sensors = JSON.parse(fs.readFileSync(path.join(__dirname, 'sensors.json'), 'utf8'));

if(!properties.id){
	require('getmac').getMac(function(err,macAddress){
		properties.id = crypto.createHmac('sha1','very_secret_key').update(macAddress).digest('base64');
		
		fs.writeFile(path.join(__dirname, 'config.properties'),JSON.stringify(properties,null,'\t'),function(err){
			console.log("id updated");
		});	
	});
}

var lat = properties.lat;
var lon = properties.lon
var name = properties.name;
var location = properties.location;
var routingServer = properties.routing_server;
var capacity = properties.capacity;

console.log(properties.lon);


/******** HTTP Server ********/

// Main view
app.get('/',function(req,res){
	console.log("someone is interested");
	var resultObject = {
		ejs:'index.ejs',
		response:{
			config:properties
		}
	}

	handleContentType(req,res,resultObject);
});

// fetch applicants
app.get('/getApplicants',function(req,res){
	state = OPERATING;

	var result = eval(properties.operation);

	res.end(JSON.stringify(
		{
		queue:queue,
		text:result
		}
	));

	notifyApplicants();
});

// Clear all subscribers from list
app.get('/clearSubscribers',function(req,res){
    	subscribers = [];
    	fs.writeFile(path.join(__dirname, 'subscribers.json'),JSON.stringify(subscribers),function(err){
	    if(err) {
	        return console.log(err);
	    }
	    console.log("subscriber database updated");
	});


	res.end("OK, shutting down")
	server.close();
});


// Start an operation
app.get('/startOperation',function(req,res){
	console.log("someone is starting the operation");

	openForRequests = true;
	
	currentRequest = (new Date())+"";
	
	message = {
		config:properties,
		time:currentRequest,
		type:'request',
		response:{
			text:eval(properties.request_text),
			type:properties.request_type,
			extras:properties.request_extras
		}
	}
		
	
	state = NOTIFYING_SUBSCRIBERS	

	broadcast(subscribers, message);
	
	res.end("ok");
});


// Handle content type for direct access (Depricated)
function handleContentType(req,res,resultObject){
	if(req.accepts('html')){
		res.render(resultObject.ejs,resultObject.response);
	} else {
 		 res.send(JSON.stringify(resultObject.response));
        }

}

// get state
app.get('/getState',function(req,res){
	res.end(JSON.stringify({state:state}));
});


/******** WebSocket Functions ********/

// WebSocketClient
var client = new WebSocketClient();
state = UNREGISTERED;
// If connection is not available, print problem
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
 
// WebSocket connection to server
client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    state = REGISTERED;
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
	    var messageObject = JSON.parse(message.utf8Data);
	    switch(messageObject.intention){
		case 'subscribe':
		    subscribe(messageObject);
			break;
		case 'unsubscribe':
		    unsubscribe(messageObject);
			break;
		case 'confirmation':
			confirmation(messageObject);
			break;
		case 'value':
			sensorInput(messageObject);
			break;
		case 'response':
			response(messageObject);
			break;
		default:
		
	    }
        }
    });
   var registrationMessage = {
	intention:'register',
	body : {
	    id:properties.id
	}
   }   

   connection.sendUTF(JSON.stringify(registrationMessage));
   connectionToServer = connection;	
});
 
client.connect('ws://'+routingServer+':8080/', 'coffee-protocol');

// Subscribe user
function subscribe(messageObject){
	console.log("subscribe event received:");
	console.log(messageObject);
	if(subscribers.indexOf(messageObject.body.id)==-1){
	    subscribers.push(messageObject.body.id);
	    fs.writeFile(path.join(__dirname, 'subscribers.json'),JSON.stringify(subscribers),function(err){
		if(err) {
		    return console.log(err);
		}
		console.log("subscriber database updated");
	    });
	}

	var message = {
	    config:properties,
	    time:(new Date()),
	    type:'subscription',
	    description:{
		text:'You are now subscribed to this machine!'
	    }  
	}

	broadcast([messageObject.body.id],message);
}

// Unsubscribe user
function unsubscribe(messageObject){
	console.log("unsubscribing: " + messageObject.body.id);
	if(subscribers.indexOf(messageObject.body.id)> -1)
	subscribers.splice(subscribers.indexOf(messageObject.body.id),1);
	fs.writeFile(path.join(__dirname, 'subscribers.json'),JSON.stringify(subscribers),function(err){
	    if(err) {
	        return console.log(err);
	    }
	});
	console.log("subscribers are now: ");
	console.log(subscribers);

}

// Trim unregistered devices from the subscribers database.
function confirmation(messageObject){
	var messageStatus;
	
	console.log(messageObject.body.gcm_result);	

	if(messageObject.body.gcm_result.failure>0)
	for(var messageIndex in messageObject.body.gcm_result.results){
		messageStatus = messageObject.body.gcm_result.results[messageIndex];
		if(messageStatus.error){
			subscribers.splice(messageIndex,1);
		        fs.writeFile(path.join(__dirname, 'subscribers.json'),JSON.stringify(subscribers),function(err){
				if(err) {
		    			return console.log(err);
				}
				console.log("subscriber database updated");
	    		});
		}
	}
	
	console.log("message sent with " + messageObject.body.gcm_result.failure+" failures.");
}


// React to response message from subscriber
function response(messageObject){
	console.log("state: " + state + " " + NOTIFYING_SUBSCRIBERS);
	console.log(messageObject);
	
	if(state != NOTIFYING_SUBSCRIBERS){
		console.log("rejecting detected");
		reject(messageObject.body.id);
		return;
	}

	if(messageObject.body.answer == "false"){
		console.log(messageObject.body.answer);
		return;
	}
	
	if(messageObject.body.time != currentRequest){
		reject(message.body.id);
		console.log(messageObject.body.time +" is not " + currentRequest);
		return;
	}

	if(queue.length <= capacity)
		queue.push(messageObject.body.id);
	else
		rejections.push(messageObject.body.id);
}

function reject(rejectionId){
		console.log("rejecting " + rejectionId);
		var notNotifyingRejection = [];
		notNotifyingRejection.push(rejectionId);
		var message={
		    config:properties,
		    time:(new Date()),
		    type:'notification',
		    description:{
			text:eval(properties.rejection_text),
			extras:properties.rejection_extras
		    }
		}

		broadcast(notNotifyingRejection,message);
}

/******** Broadcast ********/

// Notify applicants from queue and rejections
function notifyApplicants(){
	var message = {
	    config:properties,
	    time:(new Date()),
	    type:'notification',
	    description:{
		text:eval(properties.accept_text),
		extras:properties.accept_extras
	    }
	}
	broadcast(queue,message);
		
	message={
		    config:properties,
		    time:(new Date()),
		    type:'notification',
		    description:{
			text:eval(properties.reject_text),
			extras:properties.rejection_extras
		    }
		}
	broadcast(rejections,message);
	rejection = [];
	
	if(queue.length>0)
		startRoutine("operating_start");
	else
		state = OPEN_FOR_REQUEST;
}

function broadcast(listOfDevices,message){
	if(listOfDevices.length ==0)
		return;

   	currentReq = {
		intention:"broadcast",
		body:{
		    subscribers:listOfDevices,
		    message:message
		}
	}
   	connectionToServer.sendUTF(JSON.stringify(currentReq));
}

/******** Sensor Functions ********/

function startRoutine(entry){
	console.log("start routine " + entry);
	for(var i in sensors){
		if(sensors[i].program.entry == entry){
			console.log("contacting sensor: " + i);
			sensors[i].body.params = properties.id+","
						+sensors[i].program.pin+","
						+sensors[i].program.activation+","
						+sensors[i].program.description+","
						+sensors[i].program.thresshold;
			var data = querystring.stringify(sensors[i].body);

			var options = {
		 	   host: sensors[i].interface,
		 	   port: 443,
		 	   path: sensors[i].url,
	 		   method: 'POST',
			   headers: {
			        'Content-Type': 'application/x-www-form-urlencoded',
			        'Content-Length': Buffer.byteLength(data)
	    			}
			};

			var req = https.request(options, function(res) {
			   res.setEncoding('utf8');
	 		   res.on('data', function (chunk) {
			        console.log("body: " + chunk);
			    });
			});

		req.write(data);
		req.end();			
		}
	}	
}


// React to sensor input
function sensorInput(messageObject){
	if(messageObject.body.value == "true"){
		var message = {
		    config:properties,
		    time:(new Date()),
		    type:'notification',
		    description:{
			text:eval(properties.ready_text),
			extras:properties.ready_extras
		    }
		}
		broadcast(queue,message);
		state = OPEN_FOR_REQUEST;
		queue = [];
	}
}


/******** Config Functions ********/

// Config View
app.get('/config',function(req,res){
	console.log("someone is in config");

	var resultObject = {
		ejs:'config.ejs',
		response:{
			config:properties
		}
	}
	handleContentType(req,res,resultObject);
});

app.post('/config',function(req,res){
	
	for(var key in properties){
	//	console.log(key);
		if(key.indexOf('extras')!=-1){
			if(req.body[key]){
				if(properties[key].indexOf(req.body[key])==-1)
					properties[key].push(req.body[key]);				
			} else {
				properties[key] = [];
			}
		}
	}
		

	for(var key in req.body){
		if(req.body[key]!=''){
			
			if(key.indexOf('extras')==-1){
				properties[key] = req.body[key];
			}
		}
	}

	fs.writeFile(path.join(__dirname, 'config.properties'),JSON.stringify(properties,null,'\t'),function(err){
		console.log("properties updated");
	});
	

	var resultObject = {
		ejs:'config.ejs',
		response:{
			config:properties
		}
	}

	handleContentType(req,res,resultObject);
});

// Add Sensors View
app.get('/addSensor',function(req,res){
	console.log("someone is in config");

	var resultObject = {
		ejs:'addSensor.ejs',
		response:{
			sensors:sensors
		}
	}
	handleContentType(req,res,resultObject);
});

app.post('/addSensor',function(req,res){
	
	console.log(req.body);
	
	var sensorIndex = req.body.sensor_number;


	for(var key in req.body){
		if(req.body[key]!=''){
			if(key.indexOf('program.')!=-1){
				if(key.indexOf('extras')==-1){
					console.log(key.substring(8) +" - " +req.body[key]);
					sensors[sensorIndex].program[key.substring(8)] = req.body[key];
				} else {
					if(sensors[sensorIndex].program.extras.indexOf(req.body[key])==-1)
						sensors[sensorIndex].program.extras.push(req.body[key]);
				}
			} else {
				if(key.indexOf('body')==-1){
					sensors[sensorIndex][key] = req.body[key];
				} else {
					if(key.indexOf('value')==-1){
					console.log(key);
					sensors[sensorIndex].body[req.body[key]] = req.body[key.substring(0,key.indexOf('key'))+'value'];
					}
				}
			}
		}else {
		
		}
	}

	fs.writeFile(path.join(__dirname, 'sensors.json'),JSON.stringify(sensors,null,'\t'),function(err){
		console.log("sensors updated");
	});
	

	var resultObject = {
		ejs:'addSensor.ejs',
		response:{
			sensors:sensors
		}
	}

	handleContentType(req,res,resultObject);
});


/******** Depricated Functions ********/

// Close Queue (Depricated)
app.get('/closeQueue',function(req,res){
	console.log("queue is closed");
	openForRequests = false;
	
	var resultObject = {
		ejs:'dose.ejs',
		response:{
			water:(queue.length*2),
			coffee:(queue.length*2/4*3)
		}
	}
	queue = [];
	handleContentType(req,res,resultObject);
});


// Subscribe directly to device (depricated)
app.get('/subscribe',function(req,res){
	console.log(req.param('id')+" subscribed");
	var c = 200;	
	var d = 'you are now subscribed to this coffee machine!'

	if(subscribers.indexOf(req.param('id'))==-1)
		subscribers[subscribers.length] = req.param('id');
	else{
		c = 201;
		d = 'you are already subscribed to this coffee machine';
	}


	var resultObject = {
		ejs:'subscribe.ejs',
		response:{
			name:req.param('id'),
			location:lon
		}
	}
	
	handleContentType(req,res,resultObject);
});


// Request coffee from this machine (depricated)
app.get('/requestAccess', function (req, res) {
	console.log(req.param('id')+" requests access");
	var c = openForRequests ? 200 : 404
	var d = openForRequests ? 'coffee coming up!' : 'Not open for requests'
	
	
	if(req.param('id')){
		c = subscribers.indexOf(req.param('id')) >-1 ? c : 403
		d = subscribers.indexOf(req.param('id')) >-1 ? d : 'You are not subscribed to this machine'
	} else {
		c = 400
		d = 'I need your ID'
	}
	console.log(queue.length);
	if(c==200 && queue.indexOf(req.param('id'))>-1){
		c = 201;
		d = 'You have already made a request';
	}
	

	if(queue.length == capacity){
		c = 503
		d = 'Queue is full'
	} else if(c==200) {
		queue[queue.length] = req.param('id');
	}

	var resultObject = {
		ejs:'requestAccess.ejs',
		response:{
			code:c,
			description:d
		}
	}

	handleContentType(req,res,resultObject);
});



var server = app.listen(properties.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
  state = OPEN_FOR_REQUEST;

});

