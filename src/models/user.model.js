  import moongoose ,{schema }from "mongoose" ;
import  jwt from "jsonwebtoken" ;
import bcrypt from "bcrypt" ;   
  const userSchema = new moongoose.Schema(
    {
        username : {type : String , required : true , unique : true, lowercase :true,trim :true ,index:true},
        email : {type : String , required : true , unique : true,lowercase :true,trim :true ,index:true},
        fulname : {type : string , required :true,trim :true ,index:true},
        avatar: {type : String,required:true},
        coverimage:{type:string, require:true},
        watchhistory : {type : schema.Types.ObjectId , ref : "Video" },
        password : {type : String , required : true},
        refreshToken : {type : String , required : true},
        },
        {
            timestamps : true,
        }



    
  )
  userSchema.pre("save",async function(next){
    if (this.ismodified("password")) return next();
  
   
   this.password = bcrypt.hash(this.password,10)
   next()

  })


  userSchema.methods.ispasswordcorrect = async function(password){
    return await bcrypt.compare(password,this.password)
  }
  userSchema.methods.gettoken = function(){
    return jwt.sign({
        _id :this._id,
        username : this.username,
        email : this.email,
        fulname :this.fulname,
        
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
    )
  }
  userSchema.methods.getrefreshtoken = function(){return jwt.sign({
    _id :this._id,
    username : this.username,
    email : this.email,
    fulname :this.fulname,
    
},
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn : process.env.REFRESH_TOKEN_EXPIRY
}
)
}

  export const User = moongoose.model("User",userSchema)