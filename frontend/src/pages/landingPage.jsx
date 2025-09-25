import React from 'react';
import { FaBrain } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './landingPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/candidate/auth');
  };

  const handleTryDemo = () => {
    // Add demo functionality here
    console.log('Demo clicked');
  };

  return (
    <div className="app">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Next-Gen Recruitment
            <span className="highlight"> Made Simple</span>
          </h1>
          <p className="hero-subtitle">
            Revolutionize your recruitment process with cutting-edge AI technology. 
            Find, evaluate, and hire top talent 10x faster while reducing bias and improving candidate quality.
          </p>
          
          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <div className="trust-number">95%</div>
              <div className="trust-label">Match Accuracy</div>
            </div>
            <div className="trust-item">
              <div className="trust-number">50K+</div>
              <div className="trust-label">Candidates Processed</div>
            </div>
            <div className="trust-item">
              <div className="trust-number">4.9★</div>
              <div className="trust-label">User Rating</div>
            </div>
          </div>
          
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleGetStarted}>
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
              Get Started Free
            </button>
            <button className="btn-secondary" onClick={handleTryDemo}>
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </span>
              Watch Demo
            </button>
          </div>
          
        </div>
        <div className="hero-visual">
          <div className="hero-graphic">
            {/* Enhanced AI Brain Center */}
            <div className="ai-brain">
              <div className="brain-core">
                <FaBrain className="brain-icon" />
              </div>
              <div className="brain-pulse"></div>
              <div className="brain-ring"></div>
            </div>
            
            {/* Enhanced connection lines */}
            <div className="connection-line connection-line-1"></div>
            <div className="connection-line connection-line-2"></div>
            <div className="connection-line connection-line-3"></div>
            <div className="connection-line connection-line-4"></div>
            <div className="connection-line connection-line-5"></div>
            
            {/* Enhanced animated particles */}
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
            <div className="particle particle-7"></div>
            <div className="particle particle-8"></div>
            
            {/* Enhanced floating cards with icons */}
            <div className="floating-card card-1">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="card-content">
                <div className="card-title">CV Analysis</div>
                <div className="card-desc">Smart resume parsing</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
              <div className="card-content">
                <div className="card-title">Smart Matching</div>
                <div className="card-desc">Candidate-job fit</div>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div className="card-content">
                <div className="card-title">Smart Hiring</div>
                <div className="card-desc">Automated workflows</div>
              </div>
            </div>
            
            {/* Floating data elements */}
            <div className="data-element data-1">98.5%</div>
            <div className="data-element data-2">2.3s</div>
            <div className="data-element data-3">∞</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Key Features</h2>
          <p>Powerful AI-driven tools to revolutionize your recruitment process</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>AI CV Parsing</h3>
            <p>Automatically extract and analyze candidate information from resumes with advanced NLP technology.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Candidate Scoring</h3>
            <p>Intelligent scoring system that ranks candidates based on skills, experience, and job fit.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
            <h3>Job Posting Automation</h3>
            <p>Streamline your job posting process across multiple platforms with one-click automation.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>Interview Scheduling</h3>
            <p>Smart calendar integration that automatically schedules interviews based on availability.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple 4-step process to transform your recruitment</p>
        </div>
        <div className="workflow">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
              </svg>
            </div>
            <h3>Job Posting</h3>
            <p>Create and post your job requirements with AI-powered optimization</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3>CV Parsing</h3>
            <p>Our AI analyzes and extracts key information from all applications</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>AI Scoring</h3>
            <p>Advanced algorithms score and rank candidates based on fit</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <div className="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Interview & Hire</h3>
            <p>Schedule interviews and make data-driven hiring decisions</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="why-us">
        <div className="section-header">
          <h2>Why Choose Recruva</h2>
          <p>The smart choice for modern recruitment</p>
        </div>
        <div className="why-us-grid">
          <div className="why-us-item">
            <div className="why-us-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
              </svg>
            </div>
            <h3>Fair & Unbiased</h3>
            <p>AI-powered evaluation eliminates unconscious bias and ensures fair candidate assessment based purely on qualifications and skills.</p>
          </div>
          <div className="why-us-item">
            <div className="why-us-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Maximum Efficiency</h3>
            <p>Reduce time-to-hire by up to 80% with automated screening, scheduling, and candidate management workflows.</p>
          </div>
          <div className="why-us-item">
            <div className="why-us-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Smart Automation</h3>
            <p>Leverage cutting-edge AI and machine learning to automate repetitive tasks and focus on what matters most - finding the right talent.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team">
        <div className="section-header">
          <h2>Meet Our Team</h2>
          <p>The experts behind Recruva's innovation</p>
        </div>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-avatar">
              <div className="avatar-placeholder">JD</div>
            </div>
            <h3>John Doe</h3>
            <p className="member-role">CEO & Founder</p>
            <p className="member-bio">Visionary leader with 15+ years in HR tech</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">
              <div className="avatar-placeholder">JS</div>
            </div>
            <h3>Jane Smith</h3>
            <p className="member-role">CTO</p>
            <p className="member-bio">AI/ML expert driving technical innovation</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">
              <div className="avatar-placeholder">MJ</div>
            </div>
            <h3>Mike Johnson</h3>
            <p className="member-role">Head of Product</p>
            <p className="member-bio">Product strategist focused on user experience</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">
              <div className="avatar-placeholder">SB</div>
            </div>
            <h3>Sarah Brown</h3>
            <p className="member-role">Lead Designer</p>
            <p className="member-bio">Creative mind behind our intuitive interface</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="contact-container">
          <div className="contact-info">
            <h2>Get Started Today</h2>
            <p>Join thousands of companies already using Recruva to transform their recruitment process.</p>
            <div className="contact-details">
              <div className="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>hello@recruva.com</span>
              </div>
              <div className="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
          <div className="contact-form">
            <h3>Sign Up for Free</h3>
            <form>
              <div className="form-group">
                <input type="text" placeholder="Full Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Email Address" required />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Company Name" required />
              </div>
              <div className="form-group">
                <select required>
                  <option value="">Company Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">Get Started</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;