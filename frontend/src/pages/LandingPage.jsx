import React from "react";
import "../cssFiles/LandingPage.css";
import { Link } from "react-router";

const LandingPage = () => {
  return (
    <div className="landing-container">

      <div className="half cleaner-side">
        <h2>Join as a Cleaner!</h2>
        <Link to="/cleaner/login">
          <button className="btn">Login</button>
        </Link>
        <Link to="/cleaner/signup">
          <button className="btn">Sign Up</button>
        </Link>
      </div>

      <div className="half client-side">
        <h2>Join as a Client!</h2>
        <Link to="/client/login">
          <button className="btn">Login</button>
        </Link>
        <Link to="/client/signup">
          <button className="btn">Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;