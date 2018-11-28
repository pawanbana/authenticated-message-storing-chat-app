const mongoose =require('mongoose');


var RoomSchema= new mongoose.Schema({
         name:{
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
         mode:{
         	type:Boolean,
         	required:true
         },
         users:[{
                  name:{
                  type:String,
                  required:true
                  },
                  id:{
                  type:mongoose.Schema.Types.ObjectId,
                  required:true
                  }
      
           }]
 


});

RoomSchema.methods.adduser=function(name,id){
   var room=this;
   room.users.push({name,id});
   return room.save().then(()=>{return {name,id}});
};



                   
      

var Room=mongoose.model('Room',RoomSchema);

module.exports={Room};
