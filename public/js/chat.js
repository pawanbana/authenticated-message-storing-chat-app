var socket =io();
      

     $(document).ready(function(){
        var cookie=document.cookie;
        var token= cookie.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        var params=deparam(window.location.search);
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
            
              var ol=jQuery('<ol></ol>');
              data.forEach(function(datas){
                
               ol.append(jQuery('<li></li>').text(datas.name));
                });
               jQuery('#users').html(ol);
          
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

	socket.on('newLocationMessage',function(message){
		var formattedTime=moment(message.createdAt).format('h:mm a');
		var template=jQuery('#location-message-template').html();
           var html=Mustache.render(template,{
           	url:message.text,
           	from:message.name,
           	createdAt:formattedTime
           });
           jQuery('#messages').append(html);
           scrollToBottom();
           gotoBottom('messages');
		/*var formattedTime=moment(message.createdAt).format('h:mm a');
		var li=jQuery('<li></li>');
		var a=jQuery('<a target="_blank">My Current Location</a>');
		li.text(`${message.from} ${formattedTime}: `);
		a.attr('href',message.url);
		li.append(a);
		jQuery('#messages').append(li);*/
	});

	



	jQuery('#message-form').on('submit',function(e){
          e.preventDefault();
          var params=deparam(window.location.search);
          var messageTextbox = jQuery('[name=message]');
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
	});