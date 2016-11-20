var me=this;
var restify = require('restify');
var restifyMongoose = require('restify-mongoose');
var mongoose = require('mongoose');
var http = require('http');
var fs = require('fs');
var cors = require('./cors');
var calculateInterval = 2000;
var Events = require('./model/Events');
mongoose.connect('mongodb://umawa:umawa@ds159237.mlab.com:59237/umawa',['events']);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected');
});

function sendServerSendEvent(req, res) {
	console.log('SEND SERVER EVENT');
	res.writeHead(200, {
		'Content-Type' : 'text/event-stream',
		'Cache-Control' : 'no-cache',
		'Connection' : 'keep-alive',
		'Access-Control-Allow-Origin':'*',
		'Access-Control-Allow-Headers':'Origin, X-Requested-With, Content-Type, Accept'
	});
	setInterval(function() {
		var returnedData={};
		var i;
		Events.aggregate([{
	    	"$group": {
	    		"_id": {"slaveId":"$slaveId"},
	    		"timestamp": { "$max": "$timestamp" },
	    		"humiditySensorRate": { "$max": "$humiditySensorRate" },
	    		"pressionSensorRate": { "$max": "$pressionSensorRate" },
	    		"floorHumidityRate": { "$max": "$floorHumidityRate" }
	    	}
	    }, {
			"$match": {
				"pressionSensorRate": {
					"$lte": 0.5
				} 
			}
		}], function(err, data) {
			if (err){
				console.log(err);
				throw err;
			}
			if(data.length>0){
				for(i=0;i<data.length;i++){
					console.log('Send broken pipe event: '+data);
					writeServerSendEvent(res,data);
				}
			}
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