import { Router } from "express";
import { loginuser, logoutuser, refreshaccestoken, registeruser } from "../controllers/user.controller.js";
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









export default router 