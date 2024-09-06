import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { User } from "../models/user.model.js";




export const verifyCheck=asyncHandler(async(req,res,next)=>{
    try {
      const result=await User.findById(req.user?._id);
      if(!result){
        throw new ApiError(404,"not able to find the user login first")
      }  

     
      if(!result.verify){
        throw new ApiError(500,"user not verified verify first");
      }
      
      next();
    } catch (error) {
        throw new ApiError(500,error);
    }
})