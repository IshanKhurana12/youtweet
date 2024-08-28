import {Video} from "../models/video.model.js";
import multer from "multer";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import e from "express";

const uploadvideo=asyncHandler(async(req,res)=>{
    
    //check for user -using middleware so not neccesary
    //else err
    //get the vedio and thumbnail from req.files
    //upload to cloudinar
    //check the res if yes then go else err
    //if got the url from cludinary upload it using video model and add the user
    //if res true then status 200 else err
    const {title,description}=req.body;

    if(
        [title,description].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")

    }

    const videoFileLocalPath=req.files?.videoFile[0]?.path;

    if(!videoFileLocalPath){
        throw new ApiError(400,"video file is required");
    }

    const thumbnailFileLoacalPath=req.files.thumbnail[0]?.path;

    if(!thumbnailFileLoacalPath){
        throw new ApiError(400,"thumnail is required");
    }

    //upload to cloudinary
 const videoFile=await uploadOnCloudinary(videoFileLocalPath);
 const thumbnail=await uploadOnCloudinary(thumbnailFileLoacalPath);

 if(!videoFile || !thumbnail){
    throw new ApiError(400,"videofile and thumbnail not uploaded to cloudinary");
 }

 
 const video=await Video.create({
    owner:req.user,
    title,
    description,
    videoFile:videoFile?.url,
    thumbnail:thumbnail?.url
   
 });

 const createdFile=await Video.findById(video._id);
 if(!createdFile){
    throw new ApiError(500,"some error occured");
 }

 return res.status(201).
 json(new ApiResponse(200,createdFile,"uploaded successfully"));

})


const getAllVideos=asyncHandler(async(req,res)=>{
    //pipeline where we will get the videos as we match the owner with req.user
    //just display the result of aggreate and show videoFile with title descriptioon and coverimag
    try {
      const result=await Video.aggregate([
        {
            $lookup:{
                from:"users",
                localField:"owner",
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
                videoFile:1,
                thumbnail:1
            }
        }
      ]);

return res.status(200)
.json(new ApiResponse(200,result,"successfully fetched videos"));

    } catch (error) {
       
        throw new ApiError(500,"error occured");
    }
})


const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoid}=req.params;

    //only delete if the owner matches

    
    const result=await Video.aggregate([
        {
            $lookup:{
                from:"users",//kha se dhundho users se
                localField:"owner",//localfield konsi hai jiise user match krunga owner hai kyuki owner hi user hai
                foreignField:"_id",//users ki primary key
                as:"ownerDetails"
            }
        },{
            $unwind:"$ownerDetails"//deconstruct the owner detauils array
        },{
            $match:{
                //ab mai chata hu video ko match kr video id se 
                _id:new mongoose.Types.ObjectId(videoid),
                //owner ko match kro 
                "ownerDetails._id":new mongoose.Types.ObjectId(req.user._id)
                //if both matches example if video id match true && owner ===user then only it will give true;
            }
        }
    ])

    if(result.length===0){
        throw new ApiError(500,"video id or owner did't match");
    }

  
    const deleteResult=await Video.findByIdAndDelete(videoid);
    
    if(!deleteResult){
        throw new ApiError(500,"error while deleting the file");
    }

    return res.status(200).json(new ApiResponse(200,"deletion successfull"));
})





const editVideoData=asyncHandler(async(req,res)=>{
//what to do-
//get the data from params
//we will verify the user using middleware so no bt
//pipeline to find the exact user from the video model
// then match the req.user with the video owner 
//if mathches then updte else err

const {title,description}=req.body;
const {videoid}=req.params;

if(!videoid){
    throw new ApiError(400,"video id is required");
}


const result=await Video.aggregate([
    {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"ownerDetails"
        }
    
    },
    
        {
            $unwind:"$ownerDetails"
        },

        {
            $match:{
                "_id":new mongoose.Types.ObjectId(videoid),
                "ownerDetails._id":new mongoose.Types.ObjectId(req.user._id),
            }
        }
])


//now we have the pipeline to match the user and the video with the current user and the pased video id 

if(result.length===0){
    throw new ApiError(500,"errow while finding the file or the user is not same");
}


const updateObject = {};
    if (title) {
        updateObject.title = title;
    }
    if (description) {
        updateObject.description = description;
    }

const updateResult=await Video.findByIdAndUpdate(videoid,{
    $set:updateObject
},{
    new:true
})

if(!updateResult){
    throw new ApiError(500,"Error occured while updating the video details");
}


return res.status(200).json(new ApiResponse(200,updateResult,"successfully updated the video details"));


    
})


const getallCommentsofavideo=asyncHandler(async(req,res)=>{

    const {videoid}=req.params;

    if(!videoid){
        throw new ApiError(404,"videoid is required");
    }

    //find the video
    const result =await Video.aggregate([
        {
            $match:{
                "_id":new mongoose.Types.ObjectId(videoid)
            }
        },{
            $lookup:{
                from:"comments",
                localField:"allvideocomments",
                foreignField:"_id",
                as:"allcomments"
            }
        },{
            $unwind:"$allcomments"
        },{
            $project:{
                allcomments:1
            }
        }
    ])

    if(result.length===0){
        throw new ApiError(500,"no comments found or the id is not correct");
    }
    console.log(result);
    return res.status(200).json(new ApiResponse(200,result,"successfully fetched the comments"));
})



export {uploadvideo,getAllVideos,deleteVideo,editVideoData,getallCommentsofavideo}



