import {Video} from "../models/video.model.js";
import multer from "multer";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Like } from "../models/likes.model.js";
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
                thumbnail:1,
                views:1
            }
        }
      ]);

return res.status(200)
.json(new ApiResponse(200,result,"successfully fetched videos"));

    } catch (error) {
       
        throw new ApiError(500,"error occured");
    }
})

const getfeed = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    try {
        const skip = (page - 1) * limit;

        const videos = await Video.find()
            .populate('owner')
            .skip(skip)
            .limit(limit);

        const total = await Video.countDocuments();

        // Determine if there are more items to fetch
        const hasMore = skip + limit < total;

        res.status(200).json(new ApiResponse(200, {
            data: videos,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore
            }
        }, "Fetched with limit and skip"));
    } catch (error) {
        throw new ApiError(500, "Error occurred while fetching");
    }
});


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


const getsinglevideo=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    //what i want is
    //i will get the current user req.user._id
    //and then i will find him then add this video id inside his watchhistory so that i can 
    // further populate it and show  in watch history
    const {_id}=req.user;

    if(!id){
        throw new ApiError(400,"video id is required");
    }

   

    const result =await Video.findById(id).populate('owner', 'username avatar email');

    
    
    
    if(!result){
        throw new ApiError(500,"some error occured while fetching or the video id does not exist");
    }


    const viewer = await User.findByIdAndUpdate(
        _id,
        {
            $push: { watchHistory: id }
          
        },
        {
            new: true,
            runValidators: true // Ensure the update operation adheres to schema validations
        }
    );
    if (!viewer) {
        throw new ApiError(500, "Failed to update watch history");
    }

   const viewIncrease=await Video.findByIdAndUpdate(id,{
    $inc: { views: 1 }
   },  {
    new: true,
    runValidators: true // Ensure the update operation adheres to schema validations
});

if (!viewIncrease) {
    throw new ApiError(500, "Failed to update view count");
}

   
     
    return res.status(200).json(new ApiResponse(200,result,"video fetched successfuly"));
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
        }, {
            $lookup: {
                from: "users",
                localField: "allcomments.owner", // Assuming `user` is the field in `comments` that holds the user's ID
                foreignField: "_id",
                as: "alluser"
            }
        },
        {
            $unwind: "$alluser"
        },{
            $project:{
                allcomments:1,
                "alluser.username":1,
                "alluser.avatar":1
         
              
            }
        }
    ])

  
    
    return res.status(200).json(new ApiResponse(200,result,"successfully fetched the comments"));
})


const getLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    console.log('Video ID:', videoId); // Debug log

    // Find video
    const findVideo = await Video.findById(videoId);
    if (!findVideo) {
        throw new ApiError(404, "No video exists");
    }

    // Find existing like
    const existingLike = await Like.findOne({
        owner: req.user?._id,
        video: videoId
    });

    if (existingLike) {
        // Remove the like
        await Like.findByIdAndDelete(existingLike._id);

        // Update the video
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $pull: { likes: existingLike._id },
                $inc: { likecount: -1 }
            },
            { new: true } // Return the updated document
        );

        if (!updatedVideo) {
            throw new ApiError(500, "Error occurred while removing like from video");
        }

        console.log(updatedVideo.likecount);

        return res.status(200).json(new ApiResponse(200, updatedVideo, "Like removed from video successfully"));
    } else {
        // Add a new like
        const newLike = await Like.create({
            owner: req.user?._id,
            video: videoId
        });

        if (!newLike) {
            throw new ApiError(500, "Error creating like");
        }

        // Update the video
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $push: { likes: newLike._id },
                $inc: { likecount: +1 }
            },
            { new: true } // Return the updated document
        );

        if (!updatedVideo) {
            throw new ApiError(500, "Error occurred while adding like to video");
        }
        console.log(updatedVideo.likecount);
        return res.status(200).json(new ApiResponse(200, updatedVideo, "Like added to video successfully"));
    }
});


const likeStatus=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const result=await Like.find({
        owner:req.user?._id,
        video:videoId
    })
    if(!result){
        
        return res.status(200).json(new ApiResponse(200,false,"like status not valid"));
    }
    return res.status(200).json(new ApiResponse(200,true,"like status fetched successfully"));
})
export {likeStatus,uploadvideo,getAllVideos,deleteVideo,getfeed,editVideoData,getallCommentsofavideo,getsinglevideo,getLike}



