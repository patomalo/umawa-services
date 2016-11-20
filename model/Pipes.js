var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var pipesSchema=new Schema({
    masterId:Number,
    slaveId:Number,
    slaveName:String,
    lat:Number,
    lng:Number,
    created_at: Number
});
pipesSchema.pre('save', function(next) {
  var currentDate = Date.now();
  // if created_at doesn't exist, add to that field
  if (!this.created_at){
    this.created_at = currentDate;
  }
  next();
});
var Pipes = mongoose.model('pipes', pipesSchema);
module.exports = Pipes;