import { Router } from "express";
import { changecurrentuserpassword, getcurrentuser, getuserchannelprofile, getwatchhistory, loginuser, logoutuser, refreshaccestoken, registeruser, updateaccountdetails, updateuseravatar, updateusercoverimage } from "../controllers/user.controller.js";
import{upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/register").post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverimage",maxCount:1},]),registeruser
        )

router.route("/login").post(loginuser);

//secure routes
router.route("/logout").post(verifyJWT, logoutuser)
router.route("/refresh-token").post(refreshaccestoken);
router.route("/change-password").post(verifyJWT, changecurrentuserpassword)
router.route("/current-user").get(verifyJWT, getcurrentuser)
router.route("/update-account").patch(verifyJWT, updateaccountdetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateuseravatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverimage"), updateusercoverimage)

router.route("/c/:username").get(verifyJWT, getuserchannelprofile)
router.route("/history").get(verifyJWT, getwatchhistory)









export default router 