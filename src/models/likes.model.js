import mongoose from "mongoose";
import { Schema } from "mongoose";

const likeSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    video:{
        type:mongoose.Types.ObjectId,
        ref:"Video"
    }
},{timestamps:true});


export const Like=mongoose.model("Like",likeSchema);



