import mongoose from "mongoose";


const commentSchema=new mongoose.Schema({
comment:{
    type:String,
    required:true
},
owner:[{
    type:mongoose.Types.ObjectId,
    ref:"User"
}],

},{timestamps:true});



export const Comment=mongoose.model("Comment",commentSchema);