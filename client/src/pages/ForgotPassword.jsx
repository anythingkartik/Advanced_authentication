import React, { useContext, useState } from "react";
import "../styles/ForgotPassword.css";
import { useCallback } from "react";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ForgotPassword = () => {

  const {isAuthenticated}= useContext(Context);
  const [] =useState("");


  const handleForgotPassword = async (e) => {
    e.preventDefault(); //so that when i enter email and send button, it does not refresh the page(important)
    await axios
      .post("http://localhost:4000/api/v1/user/password/forgot",{email} , {
        withCredentials: true,
        headers: {
         "Content-Type": "application/json",
      },
    }).then ((res)=>{
      toast.success(res.data.message);

    }).catch((error)=>{
       toast.error(error.response.data.message);
    });
  };

  const [email, setEmail] = useState("");

  return <>
  <div className="forgot-password-page">
    <div className="forgot-password-container"> 
      <h2>Forgot Password </h2>
      <p>Enter your email address to receive password reset token</p>
      <form onSubmit={handleForgotPassword} className="forgot-password-form">
        <input type="email" placeholder="Enter your Email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="forgot-input"/>
        <button type="submit" className="forgot-btn">Send reset link</button>
      </form>
    </div>
  </div>
  
  </>;
};

export default ForgotPassword;
