$(document).ready(function(){
          var cookie=document.cookie;
	      var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
          var url='/users?token='+token;
          $.ajax({
          	method:'GET',
          	url:url,

          })
          .then(updateuserdetails)
          .catch(function(err){
          	console.log(err);
          });
     



});


$('#the_createroom').on('click',function(){
	var roomname=$('#createroomname').val();
	var mode=$('#mode').val();

	var cookie=document.cookie;
	var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    var count=0;
	var url='/rooms?token='+token;	
	 $.ajax({
          	method:'GET',
          	url:url,
          })
          .then(function(rooms){
          	rooms.forEach(function(room){
          		if(room.name==roomname){
          			count++;
          		}
          	});
          })
          .catch(function(err){
          	console.log(err);
          });

          if(count==0){
          	   var url='/rooms/create?token='+token;
               $.post(url,{name:roomname,mode:mode});
               setTimeout(function(){ location.reload(); }, 2000);
          }else{
          	alert('This room already exists');
          }
    
    
    
});


$('.logout').on('click',function(){
	var cookie=document.cookie;
	var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

	var deleteuserurl='/users/me/token?token='+token;	
	$.ajax({
		method:'GET',
		url:deleteuserurl,
		success:window.location.replace("/login")
	}).catch(function(e){
		console.log(e);
	});
});


$('.all_rooms').on('click','button',function(){
      sendRequest($(this));
});

$('.rooms_created').on('click','button',function(){
	console.log($(this).text());
	if($(this).text()!=='Create Room'){
  gotoroom($(this));
	}
           
});


  function gotoroom(room){
  	var roomname=room.data().name;
  	var id=room.data().id;

  	location.replace('/landing?room='+roomname+'&roomid='+id);
  };


function sendRequest(room){
	var roomid=room.data('id');
	var createrid=room.data('creater');
	var mode=room.data('mode');
	var roomname=room.data('name');
	var senderid=$('.username').data().id;
	var sendername=$('.username').data().name;

	if(createrid==senderid){
		alert('you created this room');
	}else{
		var cookie=document.cookie;
	    var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");        
		var url='/room/request?token='+token;
         $.post(url,{name:sendername,userid:senderid,roomname:roomname,roomid:roomid,createrid:createrid});
	     location.reload();
	     alert('request send');
	};
};




function updateuserdetails(data){
	$('.username').text(data.name);
	$('.username').data('id',data.id);
	$('.username').data('name',data.name);
	$('.useremail').text(data.email);
	updaterooms(data.rooms);
	updatependingRequest(data.pendingRequest);
	getallrooms();	
};
function updaterooms(rooms){
	rooms.forEach(function(room){
          addroom(room);
	});
};

function addroom(room){

	var newroom=$('<button class="room_name">'+room.name+'</button>');
	newroom.data('name',room.name);
	newroom.data('id',room.id);
	$('.rooms_created').append(newroom);
}; 


function userinroom(){
          var cookie=document.cookie;
	      var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
          var url='/room/user?token='+token;
          $.ajax({
          	method:'GET',
          	url:url,

          })
          .then(adduser)
          .catch(function(err){
          	console.log(err);
          });
};

function adduser(users){
	users.forEach(function(user){
		adduserinroom(user);
	});

};
function adduserinroom(user){
	 var newuser=$('<button class="user_name">'+user.name+'</button>');
	 newuser.data('name',user.name);
     $('.rooms_added').append(newuser);
};


function updatependingRequest(requests){
	
		requests.forEach(function(request){
		addpendingRequest(request);
	});
	
	
};

function addpendingRequest(request){
	var newRequest=$('<div class="roomrequest">'+
                     '<p>'+request.name+' wants to join room:'+request.roomname+'</p>'+
                     '<button class="accept">Accept</button>'+
                     '<button class="reject">Reject</button>'+
                   '</div>');
	newRequest.data('name',request.name);
	newRequest.data('userid',request.userid);
	newRequest.data('roomname',request.roomname);
	newRequest.data('roomid',request.roomid);
	newRequest.data('id',request._id);
	$('.room_requests').append(newRequest);

};
$('.room_requests').on('click','.accept',function(){
	decidefn($(this).parent(),'accept');
	
});

$('.room_requests').on('click','.reject',function(){
	decidefn($(this).parent(),'reject');
	
});

function decidefn(room,decision){
          var name=room.data().name;
          var userid=room.data().userid;
          var roomname=room.data().roomname;
          var roomid=room.data().roomid;
          var id=room.data().id;
         
          var createrid=$('.username').data().id;
          var cookie=document.cookie;
	      var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
          var url='/rooms/request/decide?token='+token;
          if(decision=='accept'){
          	     var decide=1;
               $.post(url,{id:id,decision:decide,name:name,userid:userid,roomname:roomname,roomid:roomid,createrid:createrid});
               alert('you accepted the request');
               location.reload();
          }else{
             var decide=0;
             $.post(url,{id:id,decision:decide,name:name,userid:userid,roomname:roomname,roomid:roomid,createrid:createrid});
               alert('you rejected the request');
               location.reload();

          }

};
function getallrooms() {
	var cookie=document.cookie;
	var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

	var url='/rooms?token='+token;	
	 $.ajax({
          	method:'GET',
          	url:url,
          })
          .then(function(rooms){
          	rooms.forEach(function(room){
          		addallroom(room);
          	});
          })
          .catch(function(err){
          	console.log(err);
          });
     
	
};




function addallroom(room){
	var newroom=$('<button class="allroomname">'+room.name+'</button>');
	newroom.data('id',room._id);
	newroom.data('name',room.name);
	newroom.data('creater',room._creater);
	newroom.data('mode',room.mode);
	$('.all_rooms').append(newroom);
};

function getchat(){
          
    var cookie=document.cookie;
	var token=cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    var roomid=$('.roomname').data().id;
	var url='/chat?token='+token+'&roomid='+roomid;	
	 $.ajax({
          	method:'GET',
          	url:url,
          })
          .then(function(chats){
          	chats.forEach(function(chat){
          		addchat(chat);
          	});
          })
          .catch(function(err){
          	console.log(err);
          });	
}


function addchat(chat){
	var formattedTime=moment(chat.createdAt).format('h:mm a');
	var newchat=$('div class="message">'+
                  '<p class="authorname">'+chat.name+'<span class="messagetime">'+formattedTime+'</span></p>'+
                  '<p class="messagetext">'+chat.text+'</p>'+
                '</div>');
	$('.chat_box').append(newchat);
};














/*this is for chat room*/


var socket =io();
      

     $(document).ready(function(){
        var cookie=document.cookie;
        var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        var params=deparam(window.location.search);
        $('.roomname').text(params.room);
          var url='/chat?token='+token+'&roomid='+params.roomid;
          $.ajax({
            method:'GET',
            url:url,

          })
          .then(addchats)
          .catch(function(err){
            console.log(err);
          });

});


     function addchats(chats){
    
      addusers();
      chats.forEach(function(message){
            
    var formattedTime=moment(message.createdAt).format('h:mm a');
    var template=jQuery('#message-template').html();
           var html=Mustache.render(template,{
            text:message.text,
            from:message.name,
            createdAt:formattedTime});
           jQuery('#messages').append(html);
           scrollToBottom();
           gotoBottom('messages');

      });

     };





     function scrollToBottom(){
     	var messages=jQuery('#messages');
     	var newMessage=messages.children('li:last-child');
      	var clientHeight=messages.prop('clientHeight');
     	var scrollTop=messages.prop('scrollTop');
     	var scrollHeight=messages.prop('scrollHeight');

     	var newMessageHeight=newMessage.innerHeight();
     	var lastMessageHeight=newMessage.prev().innerHeight();

      if((clientHeight + scrollTop + newMessageHeight + lastMessageHeight)>=scrollHeight)
      {
                 messages.scrollTop(scrollHeight);
      }

     };


     function gotoBottom(id){
   var element = document.getElementById(id);
   element.scrollTop = element.scrollHeight - element.clientHeight;
}
	socket.on('connect',function(){
      var params=deparam(window.location.search);

      socket.emit('join',params,function(err){
         if(err){
             alert('there is problem in getting this room');
             window.location.href='/landing';
         }else{
          console.log("fine ");

         }
      });
	});

	socket.on('disconnect',function(){
       console.log("disconnected from server ");
	});
	
function addusers(){
  
        var cookie=document.cookie;
        var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        var params=deparam(window.location.search);
       

          var url='/room/user?token='+token+'&roomid='+params.roomid;
          $.ajax({
            method:'GET',
            url:url,

          }).then(function(data){
               
             var item=$('<button class="user_name"></button>');
              data.forEach(function(datas){
                item.text(datas.name);
               $('.rooms_added').append(item);
                });
          
          }).catch(function(err){
            console.log(err);
          });
}
  



	socket.on('newMessage',function(message){
		var formattedTime=moment(message.createdAt).format('h:mm a');
		var template=jQuery('#message-template').html();
      
           var html=Mustache.render(template,{
           	text:message.text,
           	from:message.name,
           	createdAt:formattedTime
           
           });
           jQuery('#messages').append(html);
           scrollToBottom();
           gotoBottom('messages');

		/*
		var li=jQuery('<li></li>');
		li.text(`${message.from} ${formattedTime}:${message.text}`);
		jQuery('#messages').append(li);*/
	});

	

	



	jQuery('#send').on('click',function(e){
          e.preventDefault();
          var params=deparam(window.location.search);
          var messageTextbox = $('#message-form');
           var cookie=document.cookie;
           var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      
          socket.emit('createMessage',{
          	text:messageTextbox.val(),
            roomname:params.room,
            roomid:params.roomid,
            token:token
          },function(){
              messageTextbox.val('')
          });
	});

/*
	var locationButton=jQuery('#send-location');

	locationButton.on('click',function () {
		if(!navigator.geolocation){
			return alert('geolocation not supported by your browser');
		}
         locationButton.attr('disabled','disabled').text('Sending location......');
		navigator.geolocation.getCurrentPosition(function(position){
			locationButton.removeAttr('disabled').text('Send location');
      var cookie=document.cookie;
           var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      
      var params=deparam(window.location.search);
             socket.emit('createLocationMessage',{
              text:'https://www.google.com/maps?q='+position.coords.latitude+','+position.coords.longitude,
              roomname:params.room,
              roomid:params.roomid,
              token:token

             });
		},function(){
			locationButton.removeAttr('disabled').text('Send location');

			alert('unable to fetch location');
		})
	});*/