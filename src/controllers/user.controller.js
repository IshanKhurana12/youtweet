import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
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
        [fullname,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")

    }

    const existingUser=await User.findOne({
        $or:[{username}, {email}]
    })
    if(existingUser){
        throw new ApiError(409,"username with email or username exist");
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar img is required");
    }

    if(!coverLocalPath){
        throw new ApiError(400,"coverimage is required");
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

export {registerUser};