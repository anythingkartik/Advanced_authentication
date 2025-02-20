
import dotenv from "dotenv";
dotenv.config({path: "./config.env"});
import ErrorHandler from  "../middlewares/error.js";
import {catchAsyncError} from "../middlewares/catchAsyncError.js";
import {User} from "../models/userModel.js";
import {sendEmail} from "../utils/sendEmail.js";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";


const twilio_SID = process.env.TWILIO_ACCOUNT_SID;
const twilio_auth = process.env.TWILIO_AUTH_TOKEN;
const twilio_phone = process.env.TWILIO_PHONE;


const client =twilio(twilio_SID,twilio_auth); //creating a client for twilio


export const register = catchAsyncError(async (req,res,next)=>{
    try{
        const {name, email, phone, password, verificationMethod} = req.body;  //asking data from the user
        if(!name || !email || !phone || !password || !verificationMethod) {   //checking if all the fields are filled or not
            return next(new ErrorHandler("Please fill all the fields", 400)); //if not then it will show this error
        }

        //function to validate the phone number
        function validatePhoneNumber(phone) {
            const phoneRegex = /^\+91\d{10}$/;
            return phoneRegex.test(phone);
        }

        //calling the function to validate the phone number and if it is not valid then it will show this error and if true skip this
        if(!validatePhoneNumber(phone)) {
            return next (new ErrorHandler("Please enter a valid phone number", 400)); 
        }

        //function to find the user by email or number who is already verified, if it is found then it will show this error
        const existingUser = await User.findOne({
            $or: [
                {
                    email,
                    accountVerified: true,
                },
                {
                    phone,
                    accountVerified: true,
                },
            ]
        });

        //if the user is already verified then it will show this error
        if(existingUser) {
            return next(new ErrorHandler("Email or phone number already exists", 400));
        }

        //function to find the user by email or number who is not verified.
        const registerationAttemptsByUser = await User.findOne( {
            $or: [
                {email, accountVerified: false},
                {phone, accountVerified:false}
            ],
        });

        //if the user attempts to register more than 3 times then it will show this error
        if(registerationAttemptsByUser && registerationAttemptsByUser.length >3) {
            return next(new ErrorHandler("You have exceeded the maximum number of registration attempts (3).Please try again after an Hour", 400));
        }

        //User data ready to be stored in the database
        const userData ={ 
            name,
            email,
            phone,
            password,
        }

        //Here User is the model that we imported from userModel.js
        const user =await User.create(userData);

        //now we are generating the verification code and saving it to the database
        const verificationCode = await user.generateVerificationCode();
        await user.save();  //saving the user data to the database

        //sending the verification code to the user
        //email and phone as parameters, if the user wants to verify through email then the code will be sent to the email and if the user wants to verify through phone then the code will be sent to the phone
        //verificationMethod is the method that the user wants to use to verify the account
        sendVerificationCode(verificationMethod,verificationCode,name,email,phone,res); //sending the verification code to the user

    }catch(error) { 
        next(error); //if any error occurs then it will show this error
    }
});


//now we are creating a function to send the verification code to the user
async function sendVerificationCode(
    verificationMethod,
    verificationCode,
    name,
    email,
    phone,
    res
) {
    try {
        if(verificationMethod ==="email") {
            const message = generateEmailTemplate(verificationCode);
            sendEmail({email,subject:"Your Verification Code", message});
            res.status(200).json({
                success: true,
                message: `Verification code sent to your email ${email}`,
            });

        }
        else if(verificationMethod ==="phone") {
            
            const verificationCodewithSpace = verificationCode
            .toString()
            .split("")
            .join(" ");

            await client.calls.create({
                twiml: `<Response><Say>Your verification code is ${verificationCodewithSpace}. I repeat, Your verification code is ${verificationCodewithSpace}</Say></Response>`,
                from: twilio_phone,
                to: phone
            });
            res.status(200).json({
                success: true,
                message: `OTP sent`,
            });
        }
        else{
            
            return res.status(500).json({
                success: false,
                message: "Invalid verification method",
            });
            
        }
        
    } catch (error) {
        console.error("🚨 Twilio Error:", error); 
        return res.status(500).json({
            success: false,
            message: `Verification code failed to send!! ${error.message}`,
        });
    }    
}



//now we are creating a function to generate the email template
function generateEmailTemplate(verificationCode) {  
    return `<!DOCTYPE html> 
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff; text-align: center;">
            
            <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
            
            <p style="font-size: 16px; color: #333;">Dear User,</p>
            
            <p style="font-size: 16px; color: #333;">Your verification code is:</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #ffffff; background-color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px;">
                    ${verificationCode}
                </span>
            </div>
    
            <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 5 minutes.</p>
            
            <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
            
            <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
                <p>&copy; 2024 Your Company Team</p>
                <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
            </footer>
    
        </div> 
    </body> `;
    
};


//Now fxn to verify OTP

export const verifyOTP = catchAsyncError(async (req,res,next)=>{

    //asking data from the user
    const {email,phone,otp}=req.body;


      //function to validate the phone number
      function validatePhoneNumber(phone) {
        const phoneRegex = /^\+91\d{10}$/;
        return phoneRegex.test(phone);
    }

    //calling the function to validate the phone number and if it is not valid then it will show this error and if true skip this
    if(!validatePhoneNumber(phone)) {
        return next (new ErrorHandler("Please enter a valid phone number", 400)); 
    }

    //function to find the user by email or number who is not verified.
    try{    
        const userAllEntries= await User.find({
            $or:[
                {
                    email,
                    accountVerified: false,
                },
                {
                    phone,
                    accountVerified: false,
                },
            ],
        }).sort({createdAt: -1})                   //Mongoose method to sort the entries in descending order(latest entry first)

        if(!userAllEntries) {
             return next(new ErrorHandler("User not Found", 400)); 
        }

        
        

        let user;
        if(userAllEntries.length > 1) {                //if the user send suppose multiple OTPs request during register then we want to remove old entries
            user = userAllEntries[0];                   //user latest entry replaced by most recent entry

            //deleting the old entries
            await User.deleteMany({
                _id: {$ne: user._id},  //ne means not equal to. means dont delete the user entry which is not equal to the user entry         
                $or: [
                    {phone, accountVerified: false},
                    {email, accountVerified: false},
                ],
            })
        }
        else { //if the user send only one OTP request then we will take the first entry
            user=userAllEntries[0];
        }

        //if the OTP entered by user is not equal to the OTP that is stored in the database then it will show this error
        if(user.verificationCode !== Number(otp)) {
            return next(new ErrorHandler("Invalid OTP", 400));
        }

        const currentTime = Date.now(); //recived in string format, we will convert to time stamp
        const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime(); //getTime is method to fetch from database (23:23:09)

        if(currentTime > verificationCodeExpire) {
            return next(new ErrorHandler("OTP has expired", 400));
        }                      

        user.accountVerified=true; //user.accountVerified is the field in the database
        user.verificationCode=null;
        user.verificationCodeExpire=null;
        await user.save({validateBeforeSave: false}); //saving the user data to the database. user should be lower case not capital User, because we are updating only this user.


        //Now login part

        //making in utils
        sendToken(user,200,"Account Verified",res); //sending the token to the user

    } catch(error){
       return next(new ErrorHandler("Internal server errorss ", 500));
    }
});


export const login=catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body; //asking data from the user
    if(!email || !password){         //checking if all the fields are filled or not
        return next (new ErrorHandler("Email or password are missing", 400));
    }

    //finding the user by email and checking if the user is verified or not, using select to show the password(because in user model we have set select to false)
    const user= await User.findOne({email,accountVerified:true}).select("+password"); //checking if the user is verified or not
    if(!user){
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    //else if the user is verified then we will compare the password
    const isPasswordMatched=await user.comparePassword(password); //comparing the password entered by the user with the password stored in the database
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    sendToken(user,200,"User Login Successful",res); //sending the token to the user
}); 


export const logout=catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie("token","",{
        expires: new Date(
        Date.now()),
        httpOnly: true,
    }).json({
        success:true,
        message: "Logged out Successfully",
    })
    //we will also create middleware to protect the routes because after logged out the user should not be able to access the routes
    //so we make a auth.js file in the middlewares folder to remove the token from the cookies
})


export const getUser=catchAsyncError(async(req,res,next)=>{     //also will set up a route in the userRouter.js file
    const user=req.user; //getting the user from the request
    res.status(200).json({
        success:true,
        user,
    }) //it wont print password because we have set select to false in the user model
});

export const forgotPassword=catchAsyncError(async(req,res,next)=>{
    const user= await User.findOne({
        email:req.body.email,           //finding the user by email//getting the email from the user
        accountVerified:true,
    }); 
    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }
    //generating the reset password token
    const resetToken=user.generateResetPasswordToken();
    await user.save({validateBeforeSave:false}); //because no valdation is required here, we jsut gen token and save it to the database
    const resetPasswordUrl=`${process.env.FRONTEND_URL}/password/reset/${resetToken}`; //creating the reset password url

    const message=`Your reset password token is  \n\n ${resetPasswordUrl} \n\n If you have not requested this email, then ignore it.`; //creating the message to send to the user

    try {
        sendEmail({
            email: user.email, 
            subject:"Mern Auth app Reset Password",
             message
            }); //sending the email to the user
            res.status(200).json({
                success:true,
                message:`Email sent to ${user.email} successfully`,
            })
    } catch (error) {
        user.resetPasswordToken=undefined; //why we doing this because if the email is not sent then the token should not be saved in the database
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false}); //if any error occurs then it will show this error else it will validate all passwords and other fields 
        return next(new ErrorHandler(error.message? error.message : "Email could not be sent", 500
        ));
    }
});


export const resetPassword=catchAsyncError(async(req,res,next)=>{
    const {token} = req.params; //getting the token from the params
    const resetPasswordToken=crypto.createHash("sha256").update(token).digest("hex"); //creating the reset password token
    const user= await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}, //checking if the token is expired or not
    })

    if(!user){
        return next(new ErrorHandler("Invalid reset password token or has been expired", 400));
    }
    if(req.body.password !==req.body.confirmPassword){
        return next(new ErrorHandler("password and confirm password does not match", 400));
    }

    user.password=req.body.password; //setting the new password
    user.resetPasswordToken=undefined; //removing the reset password token
    user.resetPasswordExpire=undefined; //removing the reset password expire
    await user.save(); //saving the user data to the database

    //now user can login with the new password
    sendToken(user,200,"password reset successful",res); //sending the token to the user
});