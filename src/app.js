import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(cors());

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"



//router declaration
app.use("/api/v1/users",userRouter);
//http://localhost:port/users/register(dynamic)
app.use("/api/v1/video",videoRouter);
export {app}