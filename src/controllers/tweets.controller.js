import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/likes.model.js";


const addTweet=asyncHandler(async(req,res)=>{
 
        const {title,description}=req.body;
    
        if(
            [title,description].some((field)=>field?.trim()==="")
        ){
            throw new ApiError(400,"all fields are required")
    
        }
    
        const tweet=req.files?.tweet[0]?.path;
    
        if(!tweet){
            throw new ApiError(400,"video file is required");
        }
    
     
    
        //upload to cloudinary
     const tweetFile=await uploadOnCloudinary(tweet);
     
     if(!tweetFile){
        throw new ApiError(400,"tweet file is required");
     }
    
     
     const result=await Tweet.create({
        tweetowner:req.user,
        title,
        description,
        tweet:tweetFile?.url

     });
    
     const createdFile=await Tweet.findById(result._id);
     if(!createdFile){
        throw new ApiError(500,"some error occured");
     }
    
     return res.status(201).
     json(new ApiResponse(200,createdFile,"uploaded successfully"));
    
    })
    
    
const getalltweets=asyncHandler(async(req,res)=>{
    

    try {
      const result=await Like.aggregate([
        {
            $lookup:{
                from:"users",
                localField:"tweetowner",
                foreignField:"_id",
                as:"userDetails"
            }
        },
        {
            $unwind:"$userDetails"
        },
        {
            $match:{
                "userDetails._id":new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },{
            $project:{
                title:1,
                description:1,
                tweet:1,
                likecount:1,
              
            }
        }
      ]);

return res.status(200)
.json(new ApiResponse(200,result,"successfully fetched videos"));

    } catch (error) {
       
        throw new ApiError(500,"error occured");
    }


})