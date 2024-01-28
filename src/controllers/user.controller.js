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
//cuurent userpassword

const changecurrentuserpassword =asynchandler(async(req,res)=>{
   const {oldpassword,newpassword}=req.body
    
   const user =await User.findById(req.user?._id)
   const ispasswordcorrect=await user.ispasswordcorrect(oldpassword)

if (!ispasswordcorrect){throw new apierror(400,"invalid old password") 
}   

user.password=newpassword
await user.save({
   validateBeforeSave:false
})

return res
.status(200)
.json(new apiresponse(200,{},"password updated successfully"))

})
//getcurrentuser
const getcurrentuser =asynchandler(async(req,res)=>{
   return res
.status(200)
.json(new apiresponse(200,req.user,"current user fetched succesfully"))
})
//update account details

const updateaccountdetails =asynchandler(async(req,res)=>{
   const {fullName,email,username}=req.body
   if (!fullName ||  !email || !username){
      throw new apierror(400,"all fields are required")
   } 

   const user =await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{fullName,
            email:email,
            username:username,
      }
   },
      {new :true}
      ).select("-password ")
      return res
      .status(200)
      .json(new apiresponse(200,user,"user updated successfully"))
})

// upadate user avatar

const updateuseravatar =asynchandler(async(req,res)=>{
   const avatarlocalpath = req.files?.path 
   if (!avatarlocalpath){
      throw new apierror(400,"avatar is missing")
   }
   const avatar = await uploadoncloudinary(avatarlocalpath)
   if (!avatar.url){
      throw new apierror(400,"error while uploading on avatar")
   }
   const user =await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            avatar:avatar.url
         }
      },
      {new :true}
      ).select("-password ")
      return res
      .status(200)
      .json(new apiresponse(200,user,"user updated successfully"))
})

//update user coverimage
const updateusercoverimage =asynchandler(async(req,res)=>{
   const coverimagelocalpath = req.files?.path 
   if (!avatarlocalpath){
      throw new apierror(400,"avatar is missing")
   }
   const coverimage = await uploadoncloudinary(coverimagelocalpath)
   if (!coverimage.url){
      throw new apierror(400,"error while uploading on avatar")
   }
   const user =await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            avatar:avatar.url
         }
      },
      {new :true}
      ).select("-password ")
      return res
      .status(200)
      .json(new apiresponse(200,user,"user updated successfully"))
})
//get user profile
const getuserchannelprofile = asynchandler(async(req, res) => {
   const {username} = req.params

   if (!username?.trim()) {
       throw new apierror(400, "username is missing")
   }

   const channel = await User.aggregate([
       {
           $match: {
               username: username?.toLowerCase()
           }
       },
       {
           $lookup: {
               from: "subscriptions",
               localField: "_id",
               foreignField: "channel",
               as: "subscribers"
           }
       },
       {
           $lookup: {
               from: "subscriptions",
               localField: "_id",
               foreignField: "subscriber",
               as: "subscribedTo"
           }
       },
       {
           $addFields: {
               subscribersCount: {
                   $size: "$subscribers"
               },
               channelsSubscribedToCount: {
                   $size: "$subscribedTo"
               },
               isSubscribed: {
                   $cond: {
                       if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                       then: true,
                       else: false
                   }
               }
           }
       },
       {
           $project: {
               fullName: 1,
               username: 1,
               subscribersCount: 1,
               channelsSubscribedToCount: 1,
               isSubscribed: 1,
               avatar: 1,
               coverImage: 1,
               email: 1

           }
       }
   ])

   if (!channel?.length) {
       throw new apierror(404, "channel does not exists")
   }

   return res
   .status(200)
   .json(
       new apiresponse(200, channel[0], "User channel fetched successfully")
   )
})
//get watch history
const getwatchhistory = asynchandler(async(req, res) => {
   const user = await User.aggregate([
       {
           $match: {
               _id: new mongoose.Types.ObjectId(req.user._id)
           }
       },
       {
           $lookup: {
               from: "videos",
               localField: "watchHistory",
               foreignField: "_id",
               as: "watchHistory",
               pipeline: [
                   {
                       $lookup: {
                           from: "users",
                           localField: "owner",
                           foreignField: "_id",
                           as: "owner",
                           pipeline: [
                               {
                                   $project: {
                                       fullName: 1,
                                       username: 1,
                                       avatar: 1
                                   }
                               }
                           ]
                       }
                   },
                   {
                       $addFields:{
                           owner:{
                               $first: "$owner"
                           }
                       }
                   }
               ]
           }
       }
   ])

   return res
   .status(200)
   .json(
       new apiresponse(
           200,
           user[0].watchhistory,
           "Watch history fetched successfully"
       )
   )
})





export {registeruser,
   loginuser,
   logoutuser,
   refreshaccestoken,
   changecurrentuserpassword,
   getcurrentuser,
   updateaccountdetails,
   updateuseravatar,
   updateusercoverimage,
getwatchhistory,
getuserchannelprofile}