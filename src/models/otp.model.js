import mongoose from "mongoose";

const otpSchema=new mongoose.Schema({
    otp:{
        type:Number
    },
    email:{
        type:String,
    }
},{timestamps:true})


export const Otp=mongoose.model("Otp",otpSchema);