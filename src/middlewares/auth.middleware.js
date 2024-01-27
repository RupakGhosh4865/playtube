import  {asynchandler} from "../utils/asynchandler.js";
import  jwt from "jsonwebtoken"
import {apierror} from "../utils/apierror.js";
import {User} from "../models/user.model.js";

export const verifyJWT = asynchandler(async (req, res, next) => {
   
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer", "");
        console.log(token);
  
      if (!token) {
        throw new apierror(401, "You are not authorized");
      }
  
      const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, );

  
      const user = await User.findById(decodedtoken?._id).select("-password -refreshtoken");
  
      if (!user) {
        throw new apierror(401, "in valid access token");
      }
  
      req.user = user;
      next();
   
  })
  
  