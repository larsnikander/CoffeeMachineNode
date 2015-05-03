var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser')
var fs = require('fs');
var crypto = require('crypto');

// view engine setup
app.set('views', path.join(__dirname, 'coffee/view'));
app.set('view engine', 'ejs');

// Use  public folder for jQuery and Style Sheets
app.use(express.static(path.join(__dirname, 'coffee/public')));

// Put these statements before you define any routes.
app.use(bodyParser.urlencoded());
// Use bodyParser to get bodyData from req's
app.use(bodyParser.json());

var openForRequests = false;
var queue = [];
var subscribers = [];
var capacity = 6;

var properties = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.properties'), 'utf8'));

var lat = properties.lat;
var lon = properties.lon
var name = properties.name;
var location = properties.location;

console.log(properties.lon);

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

	var coffeeObject = {
		ejs:'requestAccess.ejs',
		response:{
			code:c,
			description:d
		}
	}

	handleContentType(req,res,coffeeObject);
});

app.get('/',function(req,res){
	console.log("someone is interested");
	var coffeeObject = {
		ejs:'index.ejs',
		response:{
			name:name,
			lat:lat,
			lon:lon,
			location:location
		}
	}

	handleContentType(req,res,coffeeObject);
});
app.get('/closeQueue',function(req,res){
	console.log("queue is closed");
	openForRequests = false;
	
	var coffeeObject = {
		ejs:'dose.ejs',
		response:{
			water:(queue.length*2),
			coffee:(queue.length*2/4*3)
		}
	}
	queue = [];
	handleContentType(req,res,coffeeObject);
});

app.get('/shutdown',function(req,res){
	res.end("OK, shutting down")
	server.close();
});

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


	var coffeeObject = {
		ejs:'subscribe.ejs',
		response:{
			name:req.param('id'),
			location:lon
		}
	}

	handleContentType(req,res,coffeeObject);
});

app.get('/makeCoffee',function(req,res){
	console.log("someone is making coffee");

	openForRequests = true;
	
	var coffeeObject = {
		ejs:'makeCoffee.ejs',
		response:{
			description:'Waiting for subscribers'
		}
	}
	handleContentType(req,res,coffeeObject);
});

var server = app.listen(1337, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

function handleContentType(req,res,coffeeObject){
	if(req.accepts('html')){
		res.render(coffeeObject.ejs,coffeeObject.response);
	} else {
 		 res.send(JSON.stringify(coffeeObject.response));
        }

}

