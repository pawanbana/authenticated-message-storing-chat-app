//==============================================
//All dependencies here

//==============================================




const express=require("express");
const SocketIo=require("socket.io");
const port=process.env.PORT||3000;
const http=require("http");
const bodyparser=require('body-parser');
const _=require('lodash');
const {alluserinroom}=require('./utils/subfunctions.js');
var {authenticate,authenticate2}=require('./middleware/authenticate');
var {mongoose}=require('./db/mongoose.js');
var {User}=require('./models/user.js');
var {Room}=require('./models/rooms.js');
var {Chat}=require('./models/chat.js');

const cookieParser=require('cookie-parser');




var app=express();

var server=http.createServer(app);
app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname+'/views'));

app.get('/',(req,res)=>{
	res.sendFile(__dirname+'/views/login.html');
});
app.get('/login',(req,res)=>{
	res.sendFile(__dirname+'/views/login.html');
});

app.get('/signup',(req,res)=>{
	res.sendFile(__dirname+'/views/signup.html');
});

app.get('/landing',authenticate,(req,res)=>{
	res.sendFile(__dirname+'/views/landing.html');
});

//=================================
//socket io configuration
//=================================


  
 var io=SocketIo(server);


io.on('connection',(socket)=>{



    
   
   
   socket.on('join',(params,callback)=>{
      socket.join(params.room);
     
      //socket.leave(params.room);
      //io.emit ->io.to(params.room).emit;
      //socket.broadcast.emit->socket.broadcast.to(params.room).emit;
      //socket.emit




        /*socket.emit('newMessage',generatemessage('Admin','welcome to chat app'));
        socket.broadcast.to(params.room).emit('newMessage',generatemessage('Admin',`${params.name} has joined`));*/
      callback();

   });

    socket.on('createMessage',(message,callback)=>{
        var token=message.token;
       
        User.findByToken(token).then((user)=>{
              var userid=user._id;
              var name=user.name;

            var chat=new Chat({
              text:message.text,
              _creater:userid,
              name:name,
              room:message.roomid,
              roomname:message.roomname
            });
            chat.save().then((chat)=>{
              io.to(message.roomname).emit('newMessage',{text:chat.text,name:chat.name,createdAt:chat.createdAt});
            });
        });
        
        callback();
      

    });

    

  socket.on('disconnect',()=>{
       
   
  });
   });





//=============================================
//Room Routes
//=============================================
  //Route to create a room
  app.post('/rooms/create',authenticate2,(req,res)=>{
           	var body=_.pick(req.body,['name','mode']);
            var token=req.token;
            User.findByToken(token).then((user)=>{
                	if(!user){
                		res.send('can not create room');
                	}
                  data={name:user.name,id:user._id};
                	return  data ;
              })
            .then((data)=>{
            	 var room=new Room({
            	     	name:body.name,
                		_creater:data.id,
                		mode:body.mode,
                    users:[{
                      name:data.name,
                      id:data.id
                    }]
                	});
            	room.save().then((doc)=>{
                User.findOne({_id:doc._creater}).then((user)=>{
                    user.addRoom(doc.name,doc._id);
              });
              });
              
            }).catch((e)=>{
            	res.send('there was an error in creating the room');
            });  

  
  });
 //Route to get all the rooms
  app.get('/rooms',authenticate2,(req,res)=>{
          Room.find().then((rooms)=>{
            res.send(rooms);
          },(e)=>{
          	console.log('there might be an error');
          });

  });

//Route to get users in a room
app.get('/room/user',authenticate2,(req,res)=>{
          
          Room.findOne({_id:req.query.roomid}).then((room)=>{
            
                   res.send(room.users);
          });

});

//Route to post a Request to join a room
app.post('/room/request',authenticate2,(req,res)=>{
  
   var body=_.pick(req.body,['name','userid','roomname','roomid','createrid']);
   Room.findOne({_id:body.roomid}).then((room)=>{
      var count=0;
          room.users.forEach(function(user){
            if(user.id==body.userid){
              count++;
            }
            
          });
          

          if(count==0){
                 if(room.mode==false){
                   room.adduser(body.name,body.userid);
                   User.findOne({_id:body.userid}).then((user)=>{
                   user.addRoom(body.roomname,body.roomid);
            });
         }
         else{
           User.findOne({_id:body.createrid}).then((user)=>{
            var t=0;
            user.pendingRequest.forEach(function(request){
              if(request.name==body.name && request.userid==body.userid && request.roomname==body.roomname && request.roomid==body.roomid ){
                        t++;
              }
            });
            if(t==0){
              user.addPendingRequest(body.name,body.userid,body.roomname,body.roomid);
            }
           });
         }
          }

         
   }).catch((e)=>{
     res.send("error in adding request");
   });

});
//Route to accept/decline to add a user in the room
app.post('/rooms/request/decide',authenticate2,(req,res)=>{
         var body=_.pick(req.body,['id','decision','name','userid','roomname','roomid','createrid']);
          
          if(body.decision==0){
            
               User.findOne({_id:body.createrid}).then((user)=>{
                user.removePendingRequest(body.id,body.name,body.userid,body.roomname,body.roomid);
               });
          }else if(body.decision==1){
            
                User.findOne({_id:body.createrid}).then((user)=>{
                user.removePendingRequest(body.id,body.name,body.userid,body.roomname,body.roomid);
               });
                Room.findOne({_id:body.roomid}).then((room)=>{
                  return room.adduser(body.name,body.userid);
                });
                User.findOne({_id:body.userid}).then((user)=>{
              user.addRoom(body.roomname,body.roomid);
            });

          }

});

//==============================
//Chat routes
//==============================
  //Route to save a chat
    app.post('/chat',authenticate2,(req,res)=>{
           var token=req.token;
           var body=_.pick(req.body,['text','roomid','name']);
           User.findByToken(token).then((user)=>{
           	if(!user){
           		res.send("error creating the chat");

           	}
           	return user._id;
           }).then((id)=>{
           	var chat =new Chat({
           		text:body.text,
           		_creater:id,
           		room:body.roomid,
              name:body.name

           	});
           	chat.save().then((doc)=>{
           		res.send(doc);
           	});


           }).catch((e)=>{
           	res.send("there was an error saving chat");
           });
    });
//Route to get all the chats of a room
    app.get('/chat',authenticate2,(req,res)=>{
    	var roomid=req.query.roomid;
        Chat.find({
        	room:roomid
        }).then((chats)=>{
        	res.send(chats);
        },(e)=>{
        	console.log("error getting chat");
        });


    });





//===============================
// User Routes
//===============================

//Route to post or signup a user
       app.post('/users',(req,res)=>{
       	var body=_.pick(req.body,['email','password','name']);
       	body.email=body.email.toLowerCase();
       	var user=new User(body);
         
         user.save().then(()=>{
         	return user.generateAuthToken();
         }).then((token)=>{
         	res.redirect('/direct?token='+token);
         }).catch((e)=>{
         	res.status(400).redirect('/signup');

         });

       });
 //Route to get the user details 
       app.get('/users',authenticate2,(req,res)=>{
                   var token=req.token;
                   User.findByToken(token).then((user)=>{
                       if(!user){
                        res.send('no such user is present');
                       }
                       var data ={id:user._id,name:user.name,email:user.email,rooms:user.rooms,pendingRequest:user.pendingRequest};
                       res.send(data);
                   });

       });

  //Route for user login 
       app.post('/users/login',(req,res)=>{
                 var body=_.pick(req.body,['email','password']);
                 body.email=body.email.toLowerCase();
                 User.findByCredentials(body.email,body.password).then((user)=>{
                 	return user.generateAuthToken();
                 }).then((token)=>{
                 	res.redirect('/direct?token='+token);
                 }).catch((e)=>{
                 	res.status(400).redirect('/login?');
                 });
       });
        
    

       app.get('/users/me/token',authenticate2,(req,res)=>{
       
       	req.user.removeToken(req.token).then(()=>{
       		
       		res.status(200).send();
       	},()=>{
       		res.status(400).send();
       	});
       });



    app.get('/direct',(req,res)=>{
    	res.setHeader('Set-Cookie',[`x-auth=${req.query.token}`]);
                 	res.redirect('/landing');
    });

server.listen(port,()=>{
	console.log(`server is started at ${port}`);
});