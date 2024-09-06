import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { application } from "express";


const subscribe=asyncHandler(async(req,res)=>{
    try {
     
      
        const {channelId } = req.body;

        // Check if subscriber and channel exist
    
        const channel = await User.findById(channelId);

        if (!channel) {
            throw new ApiError(404,"channel with this id does not exist or id not provided");
        }

        const existingSubscription = await Subscription.findOne({
            subscriber: req.user._id,
            channel: channelId
        });
        if (existingSubscription) {
            throw new ApiError(400, "Already subscribed to this channel");
        }
       
        // Create new subscription
        const newSubscription =await new Subscription({
            subscriber: req.user._id,
            channel: channelId
        });

        await newSubscription.save();

        res.status(200).json(new ApiResponse(200,"subscribed"));
    } catch (error) {
        console.log(error);
       throw new ApiError(500,"error occured",error);
    }
})


const getsubstatus = asyncHandler(async (req, res) => {
    try {
        // Extract userId from req.user and channelId from req.body
         // Ensure this is correctly destructured
        const { channelId } = req.body;

        if (!channelId) {
            throw new ApiError(400, "Channel ID is required");
        }

        // Check if the channel exists
        const channel = await User.findById(channelId);

        if (!channel) {
            throw new ApiError(404, "No channel found");
        }

        // Check if the user is subscribed to the channel
        const result = await Subscription.findOne({
            subscriber: req.user._id, // Ensure this matches the field name in your schema
            channel: channelId
        });

        // Respond based on whether the user is subscribed or not
    
        if (!result) {
            return res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "Not subscribed"));
        }

        return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "Subscribed"));

    } catch (error) {
        // Handle unexpected errors
        res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
    }
});


const unsubscribe=asyncHandler(async(req,res)=>{
    const {channelId}=req.body;

        if(!channelId){
        throw new ApiError(400,"channel id is required");
    }

    const channel=await User.findById(channelId);
    if(!channel){
        throw new ApiError(500,"channel does not exist or the id is wrong");
    }
    const {_id}=req.user;
    console.log(_id);
   try {
     const result=await Subscription.deleteOne({
         subscriber:_id,
         channel:channelId
     })
 
    
 
     if(result.deletedCount===0){
         throw new ApiError(404,"subscription not found");
     }

    
     return res.status(200).json(new ApiResponse(200,result,"deleted"));
 

    
 
 
   } catch (error) {
   console.log(error)
    throw new ApiError(500,"error occured while unsubscribing");
   }




})




const getsubcount=asyncHandler(async(req,res)=>{
    const {_id}=req.user._id;
    //now i want to see how many subscribers have this channel subscribed 
    const alldata=await Subscription.countDocuments({channel:_id});
    console.log(alldata);
    return res.status(200).json(new ApiResponse(200,alldata));
})


export {subscribe,unsubscribe,getsubstatus,getsubcount};