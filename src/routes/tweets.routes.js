import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyCheck } from "../middlewares/verifyCheck.middleware.js";


const router=Router();



export default router;