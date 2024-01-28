import {asynchandler} from '../utils/asynchandler.js' ;
import{apierror} from '../utils/apierror.js' ;
import {User} from '../models/user.model.js' 
import{uploadoncloudinary} from '../utils/cloudinary.js' ;
import { apiresponse } from '../utils/apiresponse.js';
import jwt from 'jsonwebtoken';

//generate access and refresh token
const generarteaccessandrefreshtoken = async (userId)=>{
   try {
      const user = await User.findById(userId)
     const accesstoken =user.gettoken()
     const refreshtoken =user.getrefreshtoken ()
     
user.refreshtoken =refreshtoken
await user.save ({validateBeforeSave :false})

return {accesstoken,refreshtoken}

   }catch(error){
      throw new apierror(500,'something went wrong while ggenerating refresh and access token')
}
}

//register
const registeruser = asynchandler(async (req,res)  => { 
   

const {fullName, email, username, password } = req.body
  



if ([fullName,email,username,password].some((field)=>(field?.trim()==="")) 
){
   throw new apierror(400,"all fields are required",400)
}


const existeduser = await User.findOne({
   $or:[{email},{username}]
})

if (existeduser){
   throw new apierror(409,"user already exists")}

//console.log(req.files);
  const avatarlocalpath = req.files?.avatar[0]?.path ;

  let coverimagelocalpath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverimagelocalpath = req.files.coverimage[0].path
    }

if (!avatarlocalpath){
throw new apierror(400,"avatar is required")
}

const avatar = await uploadoncloudinary(avatarlocalpath)
const coverimage = await uploadoncloudinary(coverimagelocalpath)

if (!avatar){
   throw new apierror(400,"avatar is required")
}



  const user= await User.create({ 
fullName,
avatar:avatar.url,
coverimage:coverimage?.url||"",
email,
password,
username:username.toLowerCase(),

})


const createduser = await  User.findById(user._id).select(

"-password -refreshtoken "
)


if(!createduser ){
   throw new apierror(400,"user not created")

}

return res.status(201).json(
   new apiresponse(200,createduser,"user registered succesfully")
)


})
//login
const loginuser = asynchandler(async (req,res)  => {  
//req-> data
//username or email
//find the user
//password check
//access and refress token
//send cookies
const{email,username,password} =req.body
if (!email && !username){
   throw new apierror(400,"email or username is required")
}

const user= await User.findOne({
   $or:[{email},{username}]
})

if (!user){
   throw new apierror(404,"user not found")
}


const ispasswordvalid =await user.ispasswordcorrect (password)

if (!ispasswordvalid){
   throw new apierror(401,"invalid password")
}
const {accesstoken,refreshtoken} = await generarteaccessandrefreshtoken(user._id)


const loginuser = await User.findById(user._id).select("-password -refreshtoken")

const options ={
   httpOnly :true,
   secure :true,
}

return res
.status(200)
.cookie("refreshtoken",refreshtoken,options)
.cookie("accesstoken",accesstoken,options)
.json(
   new apiresponse(
      200,
      {user : loginuser,accesstoken,refreshtoken},
      "user logged in successfully")
)
})
//logout
const logoutuser = asynchandler(async (req,res)  => {  
  await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshtoken:undefined
         }
      },{
         new:true
      }
      );
      const options ={
         httpOnly :true,
         secure :true
      }
      return res 
      .status(200)
      .clearCookie("refreshtoken",options)
      .clearCookie("accesstoken",options)
      .json(new apiresponse(200,{},"user logged out successfully")) 
})
//user refreshaccesstoken  end point

const refreshaccestoken =asynchandler(async(req,res)=>{
   const incomingrefreshtoken= req.cookies.refreshtoken || req.body.refreshtoken

if (!incomingrefreshtoken) {
   throw new apierror(400,"refreshtoken is required")
}
 try {
   const decodedtoken =jwt.verify(incomingrefreshtoken,
   process.env.REFRESH_TOKEN_SECRET)


   const user= await User.findById(decodedtoken?._id)
   if (!user) {
      throw new apierror(400,"invalid refreshtoken")
   }

if (user?.refreshtoken !== incomingrefreshtoken) {
throw new apierror(401,"refresh token is expired or used")
}
const options ={
   httpOnly :true,
   secure :true
}
const {accesstoken,newrefreshtoken} = await generarteaccessandrefreshtoken(user._id)
return res
.status(200)
.cookie("accesstoken",accesstoken,options)
.cookie("refreshtoken",refreshtoken,options)
.json(
   new apiresponse(
      200,
      {accesstoken,refreshtoken:newrefreshtoken},  "access token refreshed")
)}
 catch(error){
   throw new apierror(401,"invalid refresh token")
}
})



export {registeruser,loginuser,logoutuser,refreshaccestoken}