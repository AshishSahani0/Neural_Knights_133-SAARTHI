import React from "react";
import { Link } from "react-router-dom";
// Corrected typo in the image path
import heroIllustration from "../../assets/hero-illustration.png";
import anxietyIcon from "../../assets/anxiety.png";
import sleepIcon from "../../assets/sleep.png";
import studyIcon from "../../assets/study.png";
import communityIcon from "../../assets/community.png";
import musicIcon from "../../assets/music.png";
import journalingIcon from "../../assets/journaling.png";
import breathingIcon from "../../assets/breathing.png";
import relaxIcon from "../../assets/relax.png";
import "../../static/css/home.css"; // Assuming you have a CSS file for this page

const HomePage = () => {
  return (
    <>
      {/* Navbar - This should be a separate component in your final app */}
      <header>
        <nav className="navbar">
          <div className="logo">Saarthi</div>
          <ul className="nav-links">
            <li>
              <Link to="/home" className="active">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/resources">Resources</Link>
            </li>
            <li>
              <Link to="/login" className="btn">
                Begin your Journey
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Find Your Inner Calm</h1>
          <p>
            Your mental wellbeing companion – explore guided meditation, stress
            relief, and peer support in one safe platform.
          </p>
          <Link to="/login" className="cta">
            ✨ Start Your Journey
          </Link>
        </div>
        <div className="hero-img">
          <img src={heroIllustration} alt="Calm Illustration" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>How Saarthi Supports You</h2>
        <div className="cards">
          <div className="card">
            <img src={anxietyIcon} alt="Anxiety Relief" />
            <h3>Anxiety Relief</h3>
            <p>
              Guided relaxation, breathing techniques, and quick exercises to ease
              the mind.
            </p>
          </div>
          <div className="card">
            <img src={sleepIcon} alt="Better Sleep" />
            <h3>Better Sleep</h3>
            <p>Calming bedtime audios, stories, and routines for deeper rest.</p>
          </div>
          <div className="card">
            <img src={studyIcon} alt="Study Balance" />
            <h3>Study-Life Balance</h3>
            <p>
              Focus boosters, mindfulness strategies, and productivity tips for
              students.
            </p>
          </div>
          <div className="card">
            <img src={communityIcon} alt="Community Support" />
            <h3>Community Support</h3>
            <p>
              Connect anonymously with peers and trained listeners in a safe space.
            </p>
          </div>
        </div>
      </section>

      {/* Wellness Zone */}
      <section className="wellness">
        <h2>🌼 Wellness Zone</h2>
        <p>Take a break, breathe, and explore resources made for you.</p>
        <div className="wellness-grid">
          <div className="wellness-item">
            <img src={musicIcon} alt="Relaxing Music" />
            <h4>Relaxing Music</h4>
            <p>Soothing soundtracks for calm and focus.</p>
          </div>
          <div className="wellness-item">
            <img src={journalingIcon} alt="Journaling" />
            <h4>Journaling</h4>
            <p>Daily prompts to reflect and declutter your mind.</p>
          </div>
          <div className="wellness-item">
            <img src={breathingIcon} alt="Breathing Exercise" />
            <h4>Breathing Exercise</h4>
            <p>Follow guided techniques for stress relief.</p>
          </div>
          <div className="wellness-item">
            <img src={relaxIcon} alt="Sleep" />
            <h4>Sleep & Relaxation</h4>
            <p>Guided audios and tips to improve your sleep quality.</p>
          </div>
        </div>
      </section>

      {/* Motivational Quote */}
      <section className="quote">
        <blockquote>
          "Peace comes from within. Do not seek it without."
          <span>- Buddha</span>
        </blockquote>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <p>&copy; 2025 Saarthi | All Rights Reserved</p>
        </div>
      </footer>
    </>
  );
};

export default HomePage;