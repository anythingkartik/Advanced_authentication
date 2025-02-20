import React, { useContext, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main";
import OtpVerification from "./pages/OtpVerification";
import { use } from "react";

const App = () => {

const {setIsAuthenticated,setUser} =useContext(Context);

//so that when you refresh the main home page it does not log you out
useEffect(()=>{
  const getUser= async ()=>{
    await axios.get("http://localhost:4000/api/v1/user/me",{
      withCredentials: true,
    }).then((res)=>{
      setIsAuthenticated(true);
      setUser(res.data.user);
    }).catch((error)=>{
      setIsAuthenticated(false);
      setUser(null);
    })
  };
  getUser();
},[]); 


  return ( 
   <>
  <Router>
    <Routes>
      <Route path= "/" element = {<Home/>} />
      <Route path= "/auth" element={<Auth/>}/>
      <Route path= "/otp-verification/:email/:phone" element={<OtpVerification/>}/>
      <Route path= "/password/forgot" element={<ForgotPassword/>}/>
      <Route path= "/password/reset/:token" element={<ResetPassword/>}/>
    </Routes>
    <ToastContainer theme="colored"/>
  </Router>
  </>
  );
};

export default App;
