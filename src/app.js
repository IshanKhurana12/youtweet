import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
const app=express();


app.use(helmet());
app.use(cors());

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comments.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"

//router declaration
app.use("/api/v1/users",userRouter);
//http://localhost:port/users/register(dynamic)
app.use("/api/v1/video",videoRouter);

app.use("/api/v1/sub",subscriptionRouter);

app.use("/api/v1/comments",commentRouter);
export {app}