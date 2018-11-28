const {User}=require('./../models/user');


var authenticate=(req,res,next)=>{
           var main=req.headers.cookie;
           var token= main.replace(/(?:(?:^|.*;\s*)x-auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");
           
           User.findByToken(token).then((user)=>{
           	if(!user){

           		return Promise.reject();

           	}
            
           	req.user=user;
           	req.token=token;
            
           	next();
           }).catch((e)=>{
           	res.status(401).redirect('/');
            
           });




};
var authenticate2=(req,res,next)=>{
  var token=req.query.token;
 
 
   User.findByToken(token).then((user)=>{
            if(!user){

              return Promise.reject();

            }
            
            req.user=user;
            req.token=token;
            
            next();
           }).catch((e)=>{
            res.status(401).redirect('/');
            
           });

};


module.exports={authenticate,authenticate2};