import React from "react";
import "../styles/Instructor.css";
import instructorImage from "../assets/profile.jpeg";

const Instructor = () => {
  return (
    <div className="instructor-page">
      <div className="instructor-card">
        <div className="instructor-image">
          <img src={instructorImage} alt="richafk" />
        </div>
        <div className="instructor-info">
          <h1>Kartik Gupta</h1>
          <h4></h4>
          <p>
            Hello! I'm Kartik, an aspiring MERN stack developer
          </p>
          <div className="social-links">
            <a
              href="https://github.com/anythingkartik"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/itskartikgupta"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://www.youtube.com/@scaryblender"
              target="_blank"
              rel="noopener noreferrer"
            >
              Youtube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructor;
