import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Recruva</h3>
          <p>Next-Gen Recruitment Made Simple</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#why-us">Why Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
            <a href="#">Facebook</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Recruva. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
