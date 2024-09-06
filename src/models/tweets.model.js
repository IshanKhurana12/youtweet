import mongoose from "mongoose";

const tweetSchema=new mongoose.Schema({
    tweet:{
        type:String,
        required:true
    },
    tweetowner:[{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }],
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },

    comment:[
        {
        type:mongoose.Types.ObjectId,
        ref:"Comment"
        }],

        likes:[{
            type:mongoose.Types.ObjectId,
            ref:"Like"
        }],

        likecount:{
            type:Number,
            default:0
        }
},{timestamps:true});



export const Tweet=mongoose.model("Tweet",tweetSchema);