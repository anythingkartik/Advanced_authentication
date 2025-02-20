import React, { useContext } from "react";
import "../styles/Hero.css";
import heroImage from "../assets/img1.png";
import { Context } from "../main";

const Hero = () => {
  const { user } = useContext(Context);
  return (
    <>
    
      <div className="hero-section">
        <img src={heroImage} alt="hero-image" />
        <h4>Hello, {user ? user.name : "Developer"}</h4>
        <h1>Welcome to MERN Auth Tutorial</h1>
        <p>
        I built this authentication system using the MERN stack (MongoDB, Express.js, React, and Node.js) for full-stack development. I integrated Twilio for OTP verification and Nodemailer for sending verification emails.
        </p>
      </div>
    </>
  );
};

export default Hero;
