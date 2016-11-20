var me=this;
var http = require('http');
var fs = require('fs');
var cors = require('./cors');
var calculateInterval = 2000;
var Events = require('./model/Events');


function sendServerSendEvent(req, res) {
	res.writeHead(200, {
		'Content-Type' : 'text/event-stream',
		'Cache-Control' : 'no-cache',
		'Connection' : 'keep-alive',
		'Access-Control-Allow-Origin':'*',
		'Access-Control-Allow-Headers':'Origin, X-Requested-With, Content-Type, Accept'
	});
	setInterval(function() {
		//TODO: Calculate if there's a broken pipe
		var sseId = (new Date()).toLocaleTimeString();
		writeServerSendEvent(res,{
			pipeId:'101',
			timestamp:Date.now(),
			lat:0,
			lng:0,
			deltaCalculated:0.4
		});
 	}, calculateInterval);
}

function writeServerSendEvent(res, sseId, data) {
	var jsonVar=JSON.stringify(data);
	res.write("data:"+jsonVar+'\n\n');
}

http.createServer(function(req, res) {
	if (req.headers.accept && req.headers.accept == 'text/event-stream') {
		if (req.url == '/brokenPipe') {
			sendServerSendEvent(req, res);
		} else {
			res.writeHead(404);
			res.end();
		}
	} else {
		res.writeHead(200, {
			'Content-Type' : 'text/html'
		});
		res.end();
	}
}).listen(8080);