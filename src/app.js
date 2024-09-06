import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app=express();

const allowedOrigins = ['http://localhost:5173', 'https://youtweet.onrender.com','https://youtweet-frontend.vercel.app'];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};


app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comments.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetsRouter from "./routes/tweets.routes.js";
//router declaration
app.use("/api/v1/users",userRouter);
//http://localhost:port/users/register(dynamic)
app.use("/api/v1/video",videoRouter);

app.use("/api/v1/sub",subscriptionRouter);

app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/post",tweetsRouter);
export {app}