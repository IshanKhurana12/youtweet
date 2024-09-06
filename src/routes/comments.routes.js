import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addcomment } from "../controllers/comments.controller.js";

import { verifyCheck } from "../middlewares/verifyCheck.middleware.js";

const router=Router();

router.route("/add/:videoid").post(verifyJWT,verifyCheck,addcomment);

export default router;




