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
var Pipes = require('./Pipes');
var pipes = restifyMongoose(Pipes);
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
//(pipes) individualSensor
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.get('/individualSensor', pipes.query());
server.get('/individualSensor/:slaveId', pipes.detail());
server.post('/individualSensor', pipes.insert());
server.del('/individualSensor/:slaveId', pipes.remove());
//TODO: Move to mongoose-restify
/**
(Nodes) nodeSensor
*/
//Gets indivual nodeSensor
server.get("/nodeSensor", function (req, res, next) {
    db.nodes.findOne({
        masterId: req.params.masterId
    },getCommonCallback(res));
    return next();
});
//Gets indivual nodeSensor byId
server.get('/nodeSensor/:masterId', function (req, res, next) {
    db.nodes.findOne({
        masterId: req.params.masterId
    }, getCommonCallback(res));
    return next();
});
//Creates a new nodeSensor
server.post('/nodeSensor', function (req, res, next) {
    var nodeSensor = req.params;
    db.nodes.save(nodeSensor,getCommonCallback(res));
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
        }, getCommonCallback(res));
    });
    return next();
});
//TODO: Move to mongoose-restify
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
        }, getCommonCallback(res));
    return next();
});
//Gets data from a sensor between timestamps by master sensor
server.get('/eventsByMaster/:masterId', function (req, res, next) {
    db.events.find({
        masterId: req.params.masterId,
        "timestamp": {
            "$gte": new Date(req.params.fromTimestamp),
            "$lt": new Date(req.params.toTimestamp)}
        }, getCommonCallback(res));
    return next();
});
//TODO: Move to mongoose-restify
//Saves a new event
server.post('/nodeSensor', function (req, res, next) {
    var nodeSensor = req.params;
    db.nodes.save(nodeSensor,getCommonCallback(res));
    return next();
});
setInterval(function(){ 
    eventNotification.emit("brokenPipe", "Broken Pipe");
}, 3000);
server.listen(3000, function () {
    console.log("Umawa server started @ 3000");
});

module.exports = server;