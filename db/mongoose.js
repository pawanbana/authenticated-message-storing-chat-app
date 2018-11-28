var mongoose=require('mongoose');
mongoose.promise=global.promise;

mongoose.connect('mongodb://pawan:123abc@ds133353.mlab.com:33353/nodechatapp',{useNewUrlParser:true});

module.exports={mongoose};