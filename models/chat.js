
const mongoose =require('mongoose');
const moment=require('moment');

var ChatSchema= new mongoose.Schema({
         text:{
         	type:String,
         	required:true,
         	minlength:1
         },
         createdAt:{
         	type:Date,
         	default:Date.now
         },
         _creater:{
         	type:mongoose.Schema.Types.ObjectId,
         	required:true
         },
         name:{
            type:String,
            required:true
         },
         room:{
         	type:mongoose.Schema.Types.ObjectId,
         	required:true
         },
         roomname:{
            type:String,
            required:true
         }
 


});



var Chat=mongoose.model('Chat',ChatSchema);

module.exports={Chat};