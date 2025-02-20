import React, { useContext } from "react";
import "../styles/OtpVerification.css";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import { use } from "react"; // This import is unnecessary and should be removed
import { useState } from "react";
import { Context } from "../main";

const OtpVerification = () => {
  const {isAuthenticated,setIsAuthenticated,setUser}=useContext(Context);
  const { email, phone } = useParams();  //get the email and phone from the url- check route in App.jsx for otp-verification
  const [otp,setOtp]=useState(["" , "", "", "", ""]);

  //function to handle otp change, take value(otp) and its index as arguments
  const handleOtpChange = (value, index) => {
    if(!/^\d*$/.test(value)) return; //if value is not a number
    const newOtp = [...otp]; //...otp is the spread operator, it copies the otp array
    newOtp[index] = value; //set the value at index
    setOtp(newOtp); //update the otp

    //automatically moving on the next input box
    if(value && index< otp.length - 1) {
      document.getElementById(`otp-input-${index+1}`).focus(); //focus on the next input
    }
  };

  //Backspace, when we click backspace it will move to the previous input box
  const handleKeyDown=(e,index)=>{
    if(e.key==="Backspace" && otp[index]==="" && index>0) {
      document.getElementById(`otp-input-${index-1}`).focus();
    }
  }

//function to handle otp verification
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const enteredOtp= otp.join(""); //join the otp array to form a string
    const data= {
      email,
      phone,
      otp: enteredOtp,
    };
    //link from postman
    await axios.post("http://localhost:4000/api/v1/user/otp-verification", data,{ 
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res)=>{
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success(res.data.message);
    }).catch((error)=>{
      toast.error(error.response.data.message);
      setIsAuthenticated(false);
      setUser(null);
    });
  };

  //if user is already authenticated, redirect to home page
  if(isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <>
  
  <div className="otp-verification-page">
    <div className="otp-container">
      <h1>OTP Verification</h1>
      <p>Enter the 5 digit OTP sent to your registered email</p>
      <form onSubmit={handleOtpVerification} className="otp-form">
        <div className="otp-input-container">
          {
            otp.map((digit, index)=>{
                return (
                <input
                id ={`otp-input-${index}`}  //id for handling both auto next and backspace of the input otp box
                  type="text"
                  maxLength={1}
                  key={index}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="otp-input"
                />
                );
            })
          }
        </div>
        <button type="submit" className="verify-button">Verify OTP</button>
      </form>
    </div>

  </div>

  </>;
};

export default OtpVerification;
