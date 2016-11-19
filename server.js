var me=this;
var restify = require('restify');
var mongojs = require('mongojs');
var eventEmitter = require('events').EventEmitter;
var db = mongojs('mongodb://umawa:umawa@ds159237.mlab.com:59237/umawa', ['pipes','nodes','events']);
// Server
var server = restify.createServer();
var commonCallback=function (err, data) {
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(data));
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
/**
(Pipes) Individual Sensor
*/
//Gets indivual Sensor data
server.get("/individualSensor", function (req, res, next) {
    db.pipes.findOne({
        slaveId: req.params.slaveId
    },commonCallback);
    return next();
});
//Creates a new individual sensor
server.post('/individualSensor', function (req, res, next) {
    var individualSensor = req.params;
    db.pipes.save(individualSensor,commonCallback);
    return next();
});
//Updates an individual sensor
server.put('/individualSensor/:slaveId', function (req, res, next) {
    // get the existing individualSensor
    db.pipes.findOne({
        slaveId: req.params.slaveId
    }, function (err, data) {
        var updateData=me.mergeData(data,req.params);
        db.pipes.update({
            slaveId: req.params.slaveId
        }, updateData, {
            multi: false
        }, commonCallback);
    });
    return next();
});
/**
(Nodes) nodeSensor
*/
//Gets indivual nodeSensor
server.get("/nodeSensor", function (req, res, next) {
    db.nodes.findOne({
        masterId: req.params.masterId
    },commonCallback);
    return next();
});
//Gets indivual nodeSensor byId
server.get('/nodeSensor/:masterId', function (req, res, next) {
    db.nodes.findOne({
        masterId: req.params.masterId
    }, commonCallback);
    return next();
});
//Creates a new nodeSensor
server.post('/nodeSensor', function (req, res, next) {
    var nodeSensor = req.params;
    db.nodes.save(nodeSensor,commonCallback);
    return next();
});
//Updates an nodeSensor
server.put('/individualSensor/:slaveId', function (req, res, next) {
    // get the existing individualSensor
    db.pipes.findOne({
        slaveId: req.params.slaveId
    }, function (err, data) {
        var updateData=me.mergeData(data,req.params);
        db.pipes.update({
            slaveId: req.params.slaveId
        }, updateData, {
            multi: false
        }, commonCallback);
    });
    return next();
});
/**
(Events) Individual Sensor
*/
//Gets data from a sensor between timestamps by slave sensor
server.get('/eventsBySlave/:slaveId', function (req, res, next) {
    db.events.find({
        slaveId: req.params.slaveId,
        "timestamp": {
            "$gte": new Date(req.params.fromTimestamp),
            "$lt": new Date(req.params.toTimestamp)}
        }, commonCallback);
    return next();
});
//Gets data from a sensor between timestamps by master sensor
server.get('/eventsByMaster/:masterId', function (req, res, next) {
    db.events.find({
        masterId: req.params.masterId,
        "timestamp": {
            "$gte": new Date(req.params.fromTimestamp),
            "$lt": new Date(req.params.toTimestamp)}
        }, commonCallback);
    return next();
});
//Saves a new event
server.post('/nodeSensor', function (req, res, next) {
    var nodeSensor = req.params;
    db.nodes.save(nodeSensor,commonCallback);
    return next();
});
setInterval(function(){ 
    eventNotification.emit("brokenPipe", "Broken Pipe");
}, 3000);
server.listen(3000, function () {
    console.log("Umawa server started @ 3000");
});

module.exports = server;