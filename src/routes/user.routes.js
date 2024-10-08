import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelReport, getWatchHistory, getwatchhistory, loginUser, logoutUser, mailsend, registerUser, setverified, updateAvatar, updateCoverImage, updateDetails } from "../controllers/user.controller.js";
import {upload} from ".././middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
const router=Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

    router.route("/login").post(loginUser);

    router.route("/logout").post(verifyJWT,logoutUser)

    router.route("/refresh").post(refreshAccessToken);

    router.route("/currentuser").get(verifyJWT,getCurrentUser);

    router.route("/changepassword").post(verifyJWT,changeCurrentPassword);

    router.route("/updatedetails").patch(verifyJWT,updateDetails);


    router.route("/updateavatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);

    router.route("/updatecoverimage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);


    //using params :username dynamic req.params
    router.route("/channel/:username").get(verifyJWT,getUserChannelReport);

    router.route("/getwatchhistory").get(verifyJWT,getwatchhistory);
 
    router.route("/watchhistory").get(verifyJWT,getWatchHistory);

    router.route("/sendmail").get(verifyJWT,mailsend);

    router.route("/verify").post(verifyJWT,setverified);
    
export default router;
