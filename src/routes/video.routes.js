import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, uploadvideo } from "../controllers/video.controller.js";
const router=Router();



router.route("/videoupload").post(verifyJWT, upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),uploadvideo);

router.route("/getallvideos").get(verifyJWT,getAllVideos);

router.route("/delete/:videoid").delete(verifyJWT,deleteVideo);











export default router;