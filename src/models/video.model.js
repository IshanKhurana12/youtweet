import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new mongoose.Schema(
    {
videoFile:{
    type:String,
    required:true
},
thumbnail:{
    type:String,
    required:true
},
owner:
    {
        type:Schema.Types.ObjectId,
        ref:"User"
    },
title:{
    type:String,
    required:true,
},
description:{
    type:String,
    required:true
},
duration:{
    type:number,//cloudanary will give some details about the veio we will get this fgrom there
    required:true
},
views:{
    type:Number,
    default:0
},
isPublished:{
     type:Boolean,
     default:true
},

    }
,{timestamps:true});


videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Viedo",videoSchema);