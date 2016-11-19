var me=this;
var restify = require('restify');
var restifyMongoose = require('restify-mongoose');
var mongoose = require('mongoose');
var eventEmitter = require('events').EventEmitter;
mongoose.connect('mongodb://umawa:umawa@ds159237.mlab.com:59237/umawa');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    //DEBUG
    console.log('Connected');
});
var Pipes = require('./model/Pipes');
var pipes = restifyMongoose(Pipes);
var Nodes = require('./model/Master');
var nodes = restifyMongoose(Nodes);
var Events = require('./model/Events');
var events = restifyMongoose(Events);
// Server
var server = restify.createServer();
var getCommonCallback=function(res){
    return function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(data));
    }
};
var mergeData=function(baseData,newData){
    var updateData = {};
    // logic similar to jQuery.extend(); to merge 2 objects.
    for (var n in baseData) {
        updateData[n] = baseData[n];
    }
    for (var n in newData) {
        updateData[n] = newData[n];
    }
    return updateData;
};
var eventNotification = new eventEmitter;
eventNotification.on("brokenPipe", function (m) {
    console.log(m);
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
//(pipes) individualSensor
server.get('/individualSensor', pipes.query());
server.get('/individualSensor/:slaveId', pipes.detail());
server.post('/individualSensor', pipes.insert());
server.del('/individualSensor/:slaveId', pipes.remove());
//(nodes) nodeSensor
server.get('/nodeSensor', nodes.query());
server.get('/nodeSensor/:masterId', nodes.detail());
server.post('/nodeSensor', nodes.insert());
server.del('/nodeSensor/:masterId', nodes.remove());
//(events) events
server.post('/event', events.insert());
server.get('/event', events.query());
/**server.get('/eventsBySlave/:slaveId', events.query({
    slaveId: req.params.slaveId,
    "timestamp": {
        "$gte": new Date(req.params.fromTimestamp),
        "$lt": new Date(req.params.toTimestamp)}
}));
server.get('/eventsByMaster/:masterId', events.query({
    masterId: req.params.masterId,
    "timestamp": {
        "$gte": new Date(req.params.fromTimestamp),
        "$lt": new Date(req.params.toTimestamp)}
}));*/
//TODO: Fire the broken pipe event
setInterval(function(){ 
    eventNotification.emit("brokenPipe", "Broken Pipe");
}, 3000);
server.listen(3000, function () {
    console.log("Umawa server started @ 3000");
});

module.exports = server;