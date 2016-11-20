var me=this;
var restify = require('restify');
var restifyMongoose = require('restify-mongoose');
var mongoose = require('mongoose');
mongoose.connect('mongodb://umawa:umawa@ds159237.mlab.com:59237/umawa',['events']);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected');
});
var connections = [];
var Pipes = require('./model/Pipes');
var pipes = restifyMongoose(Pipes);
var Nodes = require('./model/Master');
var nodes = restifyMongoose(Nodes);
var Events = require('./model/Events');
var events = restifyMongoose(Events);
var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
//(pipes) individualSensor
server.get('/individualSensor', pipes.query());
server.get('/individualSensor/:slaveId', pipes.detail());
server.post('/individualSensor', pipes.insert());
server.del('/individualSensor/:slaveId', pipes.remove());
//(nodes) nodeSensor
server.get("/nodeSensor", function (req, res, next) {
    Nodes.aggregate([{
        "$lookup": {
            from: "pipes",
            localField: "masterId",
            foreignField: "masterId",
            as: "slaves"
        }
    }], function(err, data) {
      if (err)
        throw err;
      res.json(data);
      console.log(data);
    });
    return next();
});
server.post('/nodeSensor', nodes.insert());
server.del('/nodeSensor/:masterId', nodes.remove());
//(events) events
server.post('/event', events.insert());
server.get("/event", function (req, res, next) {
    Events.aggregate([{
        "$sort": {
            "timestamp": -1
        }
    }, {
        "$limit": 1
    }], function(err, data) {
      if (err)
        throw err;
      res.json(data);
      console.log(data);
    });
    return next();
});
server.listen(3000, function () {
    console.log("Umawa server started @ 3000");
});
module.exports = server;