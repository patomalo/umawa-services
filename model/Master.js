var me=this;
var mongoose = require('mongoose');
var Schema=mongoose.Schema;
var nodesSchema=new Schema({
    masterId:Number,
    masterName:String,
    lat:Number,
    lng:Number,
    created_at: Number
});
nodesSchema.pre('save', function(next) {
  var currentDate = Date.now();
  // if created_at doesn't exist, add to that field
  if (!this.created_at){
    this.created_at = currentDate;
  }
  next();
});
var Nodes = mongoose.model('nodes', nodesSchema);
Nodes.aggregate([{
        "$lookup": {
            from: "pipes",
            localField: "masterId",
            foreignField: "masterId",
            as: "slaves"
        }
    }],
    function(err,result) {
      console.log(err);
    }
);
module.exports = Nodes;