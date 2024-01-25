import {asynchandler} from '../utils/asynchandler.js' ;
import{apierror} from '../utils/apierror.js' ;
import {User} from '../models/user.model.js' 
import{uploadoncloudinary} from '../utils/cloudinary.js' ;
import { apiresponse } from '../utils/apiresponse.js';

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

export {registeruser,}