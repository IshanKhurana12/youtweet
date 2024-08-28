import mongoose from "mongoose";

const tweetSchema=new mongoose.Schema({
    post:{
        type:String,
        required:true
    },
    postowner:[{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }],
    comment:[
        {
        type:mongoose.Types.ObjectId,
        ref:"Comment"
        }],
        




},{timestamps:true});



export const Tweet=mongoose.model("Tweet",tweetSchema);