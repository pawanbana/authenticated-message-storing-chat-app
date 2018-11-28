var {Room}=require('./../models/rooms.js')


alluserinroom=function(rid){
             Room.findOne({_id:rid}).then((room)=>{
                 var userinroom=[];
                 room.users.forEach(function(user){
                 	userinroom.push(user.name);
                 });
                 console.log(userinroom);
             	return userinroom;
             });
          };


module.exports={alluserinroom};          