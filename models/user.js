const mongoose=require('mongoose');
const validator=require('validator');
const _=require('lodash');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
var ObjectId=require('mongoose').Types.ObjectId;

var UserSchema=new mongoose.Schema({
	email:{
		type:String,
		required:true,
		trim:true,
		minlength:2,
		unique:true,
		validate:{
			validator:(value)=>{
				return validator.isEmail(value);
			},
			message:"this is not a valid email"
		}
	},
	password:{
		type:String,
		required:true,
		minlength:6
	},
	name:{
		type:String,
		required:true,
		unique:true
	},
	tokens:[{
		access:{
			type:String,
			required:true
		},
		token:{
			type:String,
			required:true
		}
	}],
	rooms:[{
		name:{
			type:String,
			required:true
		},
		id:{
		type:mongoose.Schema.Types.ObjectId,
		required:true
		}
		
	}],
	pendingRequest:[{
		name:{
			type:String,
			required:true
		},
		userid:{
			type:mongoose.Schema.Types.ObjectId,
		    required:true
		},
		roomname:{
			type:String,
			required:true
		},
		roomid:{
			type:mongoose.Schema.Types.ObjectId,
		    required:true
		}
	}]
});

UserSchema.methods.generateAuthToken=function(){
	var user=this;
	var access='auth';
	var token =jwt.sign({_id:user._id.toHexString(),access},'ironman').toString();
	
	user.tokens.push({access,token});
	
	return user.save().then(()=>{return token;});

};



UserSchema.methods.addPendingRequest=function(name,userid,roomname,roomid){
	var user=this;
	user.pendingRequest.push({name,userid,roomname,roomid});
	user.save();
                      
};

UserSchema.methods.removePendingRequest=function(rid,name,userid,roomname,roomid){
           var user=this;
          
           user.update({$pull:{pendingRequest:{_id:rid}}},function(err,data){});

};

UserSchema.methods.addRoom=function(name,id){
	var user=this;
	user.rooms.push({name,id});
	return user.save().then(()=>{return {name,id}});
};


UserSchema.methods.removeToken=function(token){
    var user=this;
    return user.update({
    	$pull:{
    		tokens:{token}
    	}
    });
};


UserSchema.statics.findByToken=function(token){
	var user=this;
	var decoded;
	try{
		decoded=jwt.verify(token,'ironman');

	}catch(e){
		return Promise.reject();

	}
	return User.findOne({
		'_id':decoded._id,
		'tokens.token':token,
		'tokens.access':'auth'
	});
};

UserSchema.statics.findByCredentials=function(email,password){
	var User=this;
	return User.findOne({email}).then((user)=>{
		if(!user){
			return Promise.reject();
		}
		return new Promise((resolve,reject)=>{
			bcrypt.compare(password,user.password,(err,res)=>{
				if(res){
					resolve(user);
				}else{
					reject();
				}
			});
		});
	});
} ;


UserSchema.pre('save',function(next){
	var user=this;
	if(user.isModified('password')){
		bcrypt.genSalt(10,(err,salt)=>{
			bcrypt.hash(user.password,salt,(err,hash)=>{
				user.password=hash;
				next();
			});
		});
	}else{
		next();
	}
});








var User=mongoose.model('User',UserSchema);
module.exports={User};