import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addcomment } from "../controllers/comments.controller.js";



const router=Router();

router.route("/add/:videoid").post(verifyJWT,addcomment);

export default router;




