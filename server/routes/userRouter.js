import express from "express";
import {forgotPassword, getUser, login, logout, register, resetPassword, verifyOTP} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";



const router =express.Router();

//end point to register the user
router.post('/register',register);

//end point to verify the OTP
router.post("/otp-verification",verifyOTP);

router.post("/login",login);

//get request because we are not sending any data to the server
router.get("/logout",isAuthenticated,logout);  // a middleware is added to check if the user is authenticated or not

router.get("/me",isAuthenticated,getUser); //after passing the middleware isAuthenticated, the getUser function will be called which can be found in the userController.js file

router.post("/password/forgot",forgotPassword);

router.put("/password/reset/:token",resetPassword);

export default router;