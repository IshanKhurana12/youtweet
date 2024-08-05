import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt, { decode } from "jsonwebtoken"


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
        //req body-> data
        //username or email
        //find the user
        //pasword checl
        //access and refresh tokem
        //send cookie
        //res

        const {email,username,password}=req.body;

        console.log(username);

        if(!email && !username){
            throw new ApiError(400,"username or email is required");
        }

        const user=await User.findOne({
            $or:[{username}, {email}]
        })

        if(!user){
            throw new ApiError(400,"no user found register the user first")
                }
        
        const isPasswordValid=user.isPasswordCorrect(password);

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
            $set:{refreshToken:undefined}
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
export {registerUser,loginUser,logoutUser,refreshAccessToken};