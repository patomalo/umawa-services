var me=this;
var restify = require('restify');
var restifyMongoose = require('restify-mongoose');
var mongoose = require('mongoose');
var cors = require('./cors');
mongoose.connect('mongodb://umawa:umawa@ds159237.mlab.com:59237/umawa');
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
var nodesAggregate = restifyMongoose(Nodes.aggregate());
var Events = require('./model/Events');
var events = restifyMongoose(Events);
var eventsAggregate = restifyMongoose(Events.aggregate());
var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(cors());
//(pipes) individualSensor
server.get('/individualSensor', pipes.query());
server.get('/individualSensor/:slaveId', pipes.detail());
server.post('/individualSensor', pipes.insert());
server.del('/individualSensor/:slaveId', pipes.remove());
//(nodes) nodeSensor
server.get('/nodeSensor', nodes.query());
server.get('/nodeSensor/:masterId', nodesAggregate.detail());
server.post('/nodeSensor', nodes.insert());
server.del('/nodeSensor/:masterId', nodes.remove());
//(events) events
server.post('/event', events.insert());
server.get('/event', eventsAggregate.query());
server.listen(3000, function () {
    console.log("Umawa server started @ 3000");
});
module.exports = server;