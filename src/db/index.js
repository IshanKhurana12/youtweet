import mongoose, { mongo } from "mongoose";

const connectDB=async()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}`)
    }catch(err){
        console.log("mongodb connection err",err);
        process.exit(1);
    }
}

export default connectDB;