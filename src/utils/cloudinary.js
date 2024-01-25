import {v2 as cloudinary} from 'cloudinary'
import fs from "fs" 


          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadoncloudinary = async (localfilePath) => {

try{
    if(!localfilePath)
        return null

const response =await cloudinary.uploader.upload(localfilePath,{
resource_type: "auto"
}) 

//console.log("file is upload on cloudinary",response.url);
fs.unlink
return response;
}

    catch (error) {
        fs.unlinkSync(localfilePath) //remove the locally saved temporary files
     
    return null;
    }
}






export {uploadoncloudinary}










