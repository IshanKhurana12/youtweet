import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt, { decode } from "jsonwebtoken"
import multer from "multer";
import mongoose from "mongoose";


const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user= await User.findById(userId);
      const accessToken= user.generateAccessToken()
       const refreshToken=user.generateRefreshToken()

       user.refreshToken=refreshToken;
       await user.save({validateBeforeSave:false});
return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,error,"something went wrong while generating refresh and access token");
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //post the data from the user
    //validation - not empty
    //check if user already exist
    //check for images ,check for avatar
    //upload them to cloudinary
    //create user object-create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return res
    //else err
  
    const {fullName,email,username,password }=req.body

    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")

    }

    const existingUser=await User.findOne({
        $or:[{username}, {email}]
    })
    if(existingUser){
        throw new ApiError(409,"username with email or username exist");
    }
    console.log(req.files);
    const avatarLocalPath=req.files?.avatar[0]?.path;
    let coverLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverLocalPath=req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar path is required");
    }

   
   
    
   const avatar=await uploadOnCloudinary(avatarLocalPath);
  
   const coverimage=await uploadOnCloudinary(coverLocalPath);

   if(!avatar){
    throw new ApiError(400,"avatar img is required");
   }


  const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverimage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })


  const createdUser=await User.findById(user._id).select("-password -refreshToken")

  if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user");
  }


  return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered Successfully")
  )

})



const loginUser=asyncHandler(async(req,res)=>{
       
        const {email,username,password}=req.body;

       
        if(!email && !username){
            throw new ApiError(400,"username or email is required");
        }

        const user=await User.findOne({
            $or:[{username}, {email}]
        })

        if(!user){
            throw new ApiError(400,"no user found register the user first")
                }
        
        const isPasswordValid=await user.isPasswordCorrect(password);

        if(!isPasswordValid)
        {
            throw new ApiError(400,"password not correct");
        }

      const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

        const loogedInUser=await User.findById(user._id).select("-password -refreshToken")

      const options={
        httpOnly:true,
        secure:true
      }

      
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
        new ApiResponse(
            200,
            {
                user:loogedInUser,accessToken,
                refreshToken
            },"user logged in successfully"
        )
      )
    })


    const logoutUser=asyncHandler(async(req,res)=>{
      
       await User.findByIdAndUpdate(req.user._id,{
            $unset:{refreshToken:1}
        },{
            new:true
        })

        const options={
            httpOnly:true,
            secure:true
          }

          return res
          .status(200)
          .clearCookie("accessToken",options)
          .clearCookie("refreshToken",options)
          .json(new ApiResponse(200,{},"user logged out"))

    })

    const refreshAccessToken=asyncHandler(async(req,res)=>{
        //check for user
        //if user access token is not valid then create new access token
        //check for request token if valid 
        //then update ellse login again 

        const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request");
        }
try {
    
           const decodedToken=jwt.verify(accessToken,process.env.REFRESH_TOKEN_SECRET)
    
    
           const user= await User.findById(decodedToken?._id);
           if(!user){
            throw new ApiError(401,"Invalid refresh token");
           }
    
           if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used");
           }
    
           const options={
            httpOnly:true,
            secure:true
           }
          const {accessToken,newrefreshToken}= await generateAccessAndRefreshToken(user._id);
    
    
           return res.status(200).cookie("accessToken",accessToken,options)
           .cookie("refreshoken",newrefreshToken,options )
           .json(
            new ApiResponse(200,{
                accessToken,refreshToken:newrefreshToken
            },"access token refreshed")
           )
} catch (error) {
    throw new ApiError(401,error);
}
    })



    const changeCurrentPassword=asyncHandler(async(req,res)=>{
        //change current user passweord or in other language update the pasword
        //get the user
        //get the details the user want to change 
        //use the db User and update the information in this case user will be authenticated using the auth middleware
        const {oldPassword,newPassword}=req.body
        const user=await User.findById(req.user?._id);

        const isPasswordCorrect=awaituser.isPasswordCorrect(oldPassword);

        if(!isPasswordCorrect){
            throw new ApiError(400,"invalid old password");
        }

        user.password=newPassword;

        await user.save({validateBeforeSave:false})


        return res.status(200).json(new ApiResponse(200,{},"password changed successfully"));

    })


    const getCurrentUser=asyncHandler(async(req,res)=>{
            return res.status(200).json(new ApiResponse(200,req.user,"successffully fetchesd current user"))
    })



    const updateDetails=asyncHandler(async()=>{
        const {fullName}=req.body


        if(!fullName){
            throw new ApiError(400,"fullName is required");
        }

        //find the user and update
        const user=User.findByIdAndUpdate(req.user?._id,{
            $set:{
                fullName:fullName
            }
        },{
            new:true
        }).select("-password");

        return res.status(200).json(new ApiResponse(200,"updated the user's Full name "));

    })


    const updateAvatar=asyncHandler(async(req,res)=>{
        const avatarLocalPath=req.file?.path;


        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is missing");
        }

        const avatar=await uploadOnCloudinary(avatarLocalPath);


        if(!avatar.url){
            throw new ApiError(400,"Avatar url is missing");
        }



        await User.findByIdAndUpdate(req.user?._id,{
          $set: {
            avatar:avatar.url
          } 
        },{new:true}).select("-password")

        return res.status(200).json(new ApiResponse(200,"updated the avatar image sucessfully"));


    })

    const updateCoverImage=asyncHandler(async()=>{
            const {coverImageLocalPath}=req.file?.path


            if(!coverImageLocalPath){
                return ApiError(400,"no cover image provided");
            }


            const coverImage=uploadOnCloudinary(coverImageLocalPath);
            if(!coverImage.url){
                throw new ApiError(400,"cover image is required");
                }


                User.findByIdAndUpdate(req.user?._id,
                    {
                        $set:{
                            coverImage:coverImage.url
                        }
                    },{
                        new:true
                }).select("-password")

                return res.status(200).json(new ApiResponse(200,"cover image updated successfylly"))

    })


const getUserChannelReport=asyncHandler(async(req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing");
    }

    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },{
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },{
                $addFields:{
                    subscibersCount:{
                        $size:"$subscribers"
                    },
                    channelsSubscibedToCount:{
                        $size:"$subscribedTo"
                    },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        }
    },
            {
                $project:{
                    fullName:1,
                    username:1,
                    subscibersCount:1,
                    channelsSubscibedToCount:1,
                    isSubscribed:1,
                    avatar:1,
                    coverImage:1,
                    email:1
                }
            }
        
    ])


    if(!channel?.length){
        throw new ApiError(404,"channel not found");
    }

    return res.status(200).json(new ApiResponse(200,channel[0],"user channel fetched successfully "))

})

const getWatchHistory=asyncHandler(async(req,res)=>{

    const user = await User.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $lookup: {
            from: 'videos',
            localField: 'watchHistory',
            foreignField: '_id',
            as: 'watchHistory',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'owner',
                  foreignField: '_id',
                  as: 'owner',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,         // Include only user ID
                        username: 1,    // Include only username
                        avatar: 1       // Include only avatar
                        // Exclude other sensitive fields like password
                      },
                    },
                  ],
                },
              },
              {
                $addFields: {
                  owner: {
                    $arrayElemAt: ['$owner', 0],
                  },
                },
              },
              {
                $project: {
                  // Include only necessary video fields
                  _id: 1,             // Video ID
                  title: 1,           // Video title
                  description: 1,     // Video description
                  thumbnail: 1,       // Video thumbnail
                  videoFile: 1,       // Video file URL or path
                  owner: 1,           // Owner details
                },
              },
            ],
          },
        },
        {
          $project: {
            // Include only user-related fields and the modified watchHistory
            _id: 0,              // Exclude user ID from the output
            watchHistory: 1,     // Include the modified watchHistory array
          },
        },
      ]);

    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully"));
})


export {registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser,changeCurrentPassword,updateAvatar,getWatchHistory,updateDetails,updateCoverImage,getUserChannelReport};