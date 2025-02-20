import express from "express";
import {config} from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import {connection} from "./database/dbConnection.js";
import {errorMiddleware}  from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";

import {removeUnverfiedAccounts} from "./automation/removeUnverfiedAccounts.js";


export const app=express(); 
config({path: "./config.env"});

//origin is an array of all the websites that are allowed to access the server
//cors is a middleware that allows us to access the server from different origins
//because this single backend can be connected to manny frontends like admin, users and superadmin
app.use(
    cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST" , "PUT", "DELETE"],
    credentials: true,
})
); 

app.use(cookieParser()); //very important to write here, even if you are able to login a user but never be able to authenticate the user if you forget to write this line, you cant get the token from the cookies in auth.js file
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/v1/user", userRouter);

removeUnverfiedAccounts();

//connection to the database
connection();


//It is always a good practice to use error handling middleware at the end of all the middlewares
//dont add () after errorMiddleware, because we are not calling the function, we are just passing the reference of the function else error shown
app.use(errorMiddleware);
