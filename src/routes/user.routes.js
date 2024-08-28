import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelReport, getWatchHistory, loginUser, logoutUser, registerUser, updateAvatar, updateCoverImage, updateDetails } from "../controllers/user.controller.js";
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


    router.route("/updateavater").patch(verifyJWT,upload.single("avatar"),updateAvatar);

    router.route("/updatecoverimage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);


    //using params :username dynamic req.params
    router.route("/channel/:username").get(verifyJWT,getUserChannelReport);

 
    router.route("/watchhistory").get(verifyJWT,getWatchHistory);
export default router;