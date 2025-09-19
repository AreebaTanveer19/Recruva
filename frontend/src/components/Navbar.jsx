import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h1>Recruva</h1>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#why-us">Why Us</a>
          <a href="#team">Team</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
