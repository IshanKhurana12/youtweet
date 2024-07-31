import mongoose,{Schema, mongo} from "mongoose";
import bcrypt from "bcrypt"
import { jwt } from "jsonwebtoken";
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
       
    },
    fullName:{
        type:String,
        required:true,
        unique:true,
        index:true,
        trim:true,
    },
    avatar:{
        type:String,
        required:true,
        unique:true,
    
       
    },
    coverImage:{
        type:String,
    },
    password:{
        type:String,
        required:[true,'password is required'],
     
       
    },
    refreshToken:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
},{timestamps:true});


userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password=bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.userName,
        },
        process.env.ACEESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
          
        },
        process.env.ACEESS_REFRESH_SECRET,
        {
            expiresIn:process.env.ACCESS_REFRESH_EXPIRY
        }
    )
}
export const User=mongoose.model("User",userSchema)