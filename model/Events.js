var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var eventsSchema=new Schema({
    created_at: Number,
    slaveId:Number,
    masterId:Number,
    timestamp: Number,
    humiditySensorRate:Number,
    pressionSensorRate:Number,
    floorHumidityRate:Number
});
eventsSchema.pre('save', function(next) {
  var currentDate = Date.now();
  // if created_at doesn't exist, add to that field
  if (!this.created_at){
    this.created_at = currentDate;
  }
  next();
});
var Events = mongoose.model('events', eventsSchema);
module.exports = Events;