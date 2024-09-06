import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, editVideoData, getAllVideos, getLike, getallCommentsofavideo, getfeed, getsinglevideo, likeStatus, uploadvideo } from "../controllers/video.controller.js";
import { verifyCheck } from "../middlewares/verifyCheck.middleware.js";
const router=Router();



router.route("/videoupload").post(verifyJWT,verifyCheck, upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),uploadvideo);

router.route("/getallvideos").get(verifyJWT,verifyCheck,getAllVideos);

router.route("/delete/:videoid").delete(verifyJWT,deleteVideo);

router.route("/edit/:videoid").patch(verifyJWT,editVideoData);

router.route("/getallcomments/:videoid").get(verifyJWT,getallCommentsofavideo);

router.route("/getsinglevideo/:id").get(verifyJWT,verifyCheck,getsinglevideo);

router.route("/getfeed").get(verifyJWT,verifyCheck,getfeed);

router.route("/like/:videoId").post(verifyJWT,verifyCheck,getLike);

router.route("/likestatus/:videoId").post(verifyJWT,likeStatus);
export default router;