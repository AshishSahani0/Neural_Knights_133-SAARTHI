import React from 'react';
import { Link } from 'react-router-dom';
// IMPORTANT: You need to ensure these images exist in your /src/assets/images folder
// and are correctly imported. Since I don't have your specific file system, 
// I will import them as variables, which is the standard React way.
// The actual path will be relative to the HomePage.jsx file location.

// Assuming the images are placed within a generic assets/images folder or similar
import harshitImage from '../../assets/Harshit.png';
import sudhaImage from '../../assets/sudha.png';
import ayushImage from '../../assets/ayush.png';
import ashImage from '../../assets/ash.png';
import prakImage from '../../assets/prak.png';
import namitImage from '../../assets/namit.png';
import '../../static/css/about.css'; // Assuming you have a CSS file for this page

const AboutPage = () => {
  return (
    <>
      {/* Navbar - This should be a separate component in your final app */}
      <header>
        <nav className="navbar">
          <div className="logo">Saarthi</div>
          <ul className="nav-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/about" className="active">About</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><Link to="/login" className="btn">Begin your Journey</Link></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>About <span>Saarthi</span></h1>
          <p>Your trusted companion for mental health and student wellbeing</p>
        </div>
      </section>

      {/* Mission / Vision Cards */}
      <section className="features">
        <h2>Our Purpose</h2>
        <div className="cards">
          <div className="card">
            <h3>🎯 Mission</h3>
            <p>Empowering students with accessible mental wellness tools, counseling, and support community.</p>
          </div>
          <div className="card">
            <h3>💡 Approach</h3>
            <p>Blending AI-guided support, peer connections, and professional guidance for holistic care.</p>
          </div>
          <div className="card">
            <h3>🌍 Why Saarthi?</h3>
            <p>Designed for Indian students with language support, offline access, and institutional collaboration.</p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <h2>Our Journey</h2>
        <div className="timeline">
          <div className="timeline-item left">
            <div className="content">
              <h3>2023</h3>
              <p>Idea conceptualized by educators & students passionate about mental wellness.</p>
            </div>
          </div>
          <div className="timeline-item right">
            <div className="content">
              <h3>2024</h3>
              <p>Prototype tested in colleges with positive engagement from students.</p>
            </div>
          </div>
          <div className="timeline-item left">
            <div className="content">
              <h3>2025</h3>
              <p>Official launch, reaching thousands of students across India.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-cards">
          <div className="team-card">
            <img src={harshitImage} alt="Harshit Nainwal"/>
            <h3>Harshit Nainwal</h3>
            <p>Frontend & UI</p>
          </div>
          <div className="team-card">
            <img src={sudhaImage} alt="Sudhanshu Mishra"/>
            <h3>Sudhanshu Mishra</h3>
            <p>Leader</p>
          </div>
          <div className="team-card">
            <img src={ayushImage} alt="Ayush Kumar Mandal"/>
            <h3>Ayush Kumar Mandal</h3>
            <p>Student Advisor </p>
          </div>
          <div className="team-card">
            <img src={ashImage} alt="Ashish Sahani"/>
            <h3>Ashish Sahani </h3>
            <p>Backend & Database</p>
          </div>
          <div className="team-card">
            <img src={prakImage} alt="Prakriti Srivastava"/>
            <h3>Prakriti Srivastava</h3>
            <p>Documentation </p>
          </div>
          <div className="team-card">
            <img src={namitImage} alt="Namit Raj"/>
            <h3>Namit Raj</h3>
            <p>Research & AI Developer</p>
          </div>
        </div>
      </section>

      {/* Footer - This should be a separate component in your final app */}
      <footer>
        <div className="footer-content">
          <p>&copy; 2025 Saarthi | All Rights Reserved</p>
          <p>Contact: support@saarthi.org | Helpline: +91-1234567890</p>
          <p>Address: NIET, Greater Noida</p>
        </div>
      </footer>
    </>
  );
};

export default AboutPage;