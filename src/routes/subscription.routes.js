import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getsubstatus, subscribe, unsubscribe } from "../controllers/subscription.controller.js";

const router=Router();



router.route("/subscribe").post(verifyJWT,subscribe);
router.route("/unsubscribe").post(verifyJWT,unsubscribe);
router.route('/getstatus').post(verifyJWT,getsubstatus);

export default router;