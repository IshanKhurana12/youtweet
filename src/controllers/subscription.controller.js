import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";


const subscribe=asyncHandler(async(req,res)=>{
    try {
        const {subscriberId}=req.user?._id;
        const {channelId } = req.body;

        // Check if subscriber and channel exist
    
        const channel = await User.findById(channelId);

        if (!channel) {
            throw new ApiError(404,"channel with this id does not exist or id not provided");
        }

        // Create new subscription
        const newSubscription = new Subscription({
            subscriber: subscriberId,
            channel: channelId
        });

        await newSubscription.save();

        res.status(200).json(new ApiResponse(200,"subscribed"));
    } catch (error) {
       throw new ApiError(500,"error occured",error);
    }
})


const unsubscribe=asyncHandler(async(req,res)=>{
    const {channelId}=req.body;

    const {subscriberId}=req.user._id;
        if(!channelId){
        throw new ApiError(400,"channel id is required");
    }

    const channel=User.findById(channelId);
    if(!channel){
        throw new ApiError(500,"channel does not exist or the id is wrong");
    }

   try {
     const result=await Subscription.deleteOne({
         subscriber:subscriberId,
         channel:channelId
     })
 
 
 
     if(result.deletedCount===0){
         throw new ApiError(404,"subscription not found");
     }
 
 
 

     return res.status(200).json(new ApiResponse(200,"unsubscribe successfull"));
 
 
   } catch (error) {
    throw new ApiError(500,"error occured while unsubscribing");
   }




})


export {subscribe,unsubscribe};