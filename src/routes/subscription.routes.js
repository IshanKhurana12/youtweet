import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getsubcount, getsubstatus, subscribe, unsubscribe } from "../controllers/subscription.controller.js";
import { verifyCheck } from "../middlewares/verifyCheck.middleware.js";

const router=Router();



router.route("/subscribe").post(verifyJWT,verifyCheck,subscribe);
router.route("/unsubscribe").post(verifyJWT,verifyCheck,unsubscribe);
router.route('/getstatus').post(verifyJWT,verifyCheck,getsubstatus);
router.route('/getcount').get(verifyJWT,verifyCheck,getsubcount);
export default router;