import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


// User Schema
// Schema is a blueprint of how the data will be stored in the database
//phone is stored in String rather than Numbers because if it has 0 in the beginning then it will be removed
const userSchema =new mongoose.Schema({
    name : String,
    email: String,
    password: {
        type: String,
        minLength: [8, "Password must be atleast 8 characters long"],
        maxLength: [32, "Password must be atmost 32 characters long"],
        select: false, //this is used to not show the password in the response
    },
    phone: String,
    accountVerified: {type : Boolean, default: false},
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type :Date,
        default: Date.now
    },
});

// Hashing the password before saving it to the database
//if condition is used to check if the password is modified or not, if it is not modified then it will not hash the password again
//this.password is used to get the password that is entered by the user
//10 is the number of rounds of hashing,more can make the password more secure but it will take more time to hash the password, less rounds will make the password less secure
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) {
        next();
    }

    this.password= await bcrypt.hash(this.password, 10);
});

//a method to compare the password entered by the user with the password stored in the database
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

//this is used in the userController.js file to generate the verification code
userSchema.methods.generateVerificationCode = function() {
    function generateRandomNumber() {
        const firstDigit= Math.floor(Math.random() * 9 + 1);
        const remainingDigits = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4,0);

        return parseInt(firstDigit + remainingDigits);
    }

    const verificationCode = generateRandomNumber();
    this.verificationCode = verificationCode;
    this.verificationCodeExpire = Date.now() + 5 * 60 * 1000; //5 minutes , the code will expire after 5 minutes

    return verificationCode;
};

//this is used in the userController.js file to generate the reset password token
userSchema.methods.generateToken = async function() {
    return await jwt.sign({id: this._id},process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRE,
    });
}

userSchema.methods.generateResetPasswordToken= function(){
    const resetToken=crypto.randomBytes(20).toString("hex"); //generating a random token

    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex"); //hashing the token using sha256 and then converting it to hex
    this.resetPasswordExpire=Date.now() + 5 * 60 * 1000; //5 minutes, the token will expire after 15 minutes

    return resetToken;

}


//exporting the model so that we can use it in other files
export const User=mongoose.model("User", userSchema);