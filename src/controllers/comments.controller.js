import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/video.model.js";

const addcomment=asyncHandler(async(req,res)=>{
    //to add a comment first get a comment and then just add a comment in the video like 
    //first add a commnet in commnet 

    //use video model to add a comment

    const {comment}=req.body;
    const {videoid}=req.params;
    if(!videoid){
       throw new ApiError(400,"video id is required");
    }

    const createcomment= await Comment.create({
        comment:comment,
        owner:req.user
    })

    //comment created now push this comment to video 

    if(!createcomment){
        throw new ApiError(500,"some error occured while creating comment");
    }

    const result=await Video.findByIdAndUpdate( videoid,
        { $push: { allvideocomments: createcomment._id } },
        { new: true } // Return the updated document
    )

    if(!result){
        throw new ApiError(500,"some error occured while updating video comments");
    }

    return res.status(200).json(new ApiResponse(200,result,"comment added to video successfully"));


})


export {addcomment};