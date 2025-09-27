import React from 'react';
import { Link } from 'react-router-dom';
// IMPORTANT: Import all image assets from the common assets folder
import articlesImage from '../../assets/articles.png';
import videosImage from '../../assets/videos.png';
import audiosImage from '../../assets/audios.png';
import appsImage from '../../assets/apps.png';
import breathingImage from '../../assets/breathing.png';
import journalingImage from '../../assets/journaling.png';
import breathing1Image from '../../assets/breathing1.png';
import relaxImage from '../../assets/relax.png';

// Assuming you have a CSS file for general styling
import '../../static/css/resources.css'; 

const ResourcesPage = () => {
  return (
    <div className="resources-page">
      {/* Navbar - Note: In a real app, this should be a separate shared component */}
      <header>
        <nav className="navbar">
          <div className="logo">Saarthi</div>
          <ul className="nav-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/resources" className="active">Resources</Link></li>
            <li><Link to="/login" className="btn">Begin your Journey</Link></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Explore Our <span>Resources</span></h1>
          <p>Curated mental health and wellness materials to support your journey toward balance and focus.</p>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="features">
        <h2>Resource Categories</h2>
        <div className="cards">
          <div className="card">
            <img src={articlesImage} alt="Articles" />
            <h3>Articles</h3>
            <p>Well-researched articles on stress management, mindfulness, and productivity.</p>
            <Link to="#" className="btn">Explore</Link>
          </div>
          <div className="card">
            <img src={videosImage} alt="Videos" />
            <h3>Videos</h3>
            <p>Relaxing guided meditations, yoga sessions, and mental wellness tutorials.</p>
            <Link to="#" className="btn">Watch</Link>
          </div>
          <div className="card">
            <img src={audiosImage} alt="Audios" />
            <h3>Audios</h3>
            <p>Curated playlists for sleep, focus, and calm, available anytime.</p>
            <Link to="#" className="btn">Listen</Link>
          </div>
          <div className="card">
            <img src={appsImage} alt="Apps" />
            <h3>Apps & Tools</h3>
            <p>Recommended apps and digital tools to track your mental wellbeing daily.</p>
            <Link to="#" className="btn">Discover</Link>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="wellness">
        <h2>Featured Resources</h2>
        <div className="wellness-grid">
          <div className="wellness-item">
            <img src={breathingImage} alt="Meditation" />
            <h3>10-Minute Daily Meditation</h3>
            <p>Quick guided meditation to reduce stress and increase focus.</p>
            <Link to="#" className="cta">Start Now</Link>
          </div>
          <div className="wellness-item">
            <img src={journalingImage} alt="Journaling" />
            <h3>Reflective Journaling</h3>
            <p>Simple prompts to reflect on thoughts and emotions daily.</p>
            <Link to="/journaling" className="cta">Try It</Link>
          </div>
          <div className="wellness-item">
            <img src={breathing1Image} alt="Breathing" />
            <h3>Breathing Exercises</h3>
            <p>Easy 4-7-8 and box breathing exercises to calm your mind.</p>
            <Link to="#" className="cta">Learn More</Link>
          </div>
          <div className="wellness-item">
            <img src={relaxImage} alt="Sleep" />
            <h4>Sleep & Relaxation</h4>
            <p>Guided audios and tips to improve your sleep quality.</p>
            <Link to="#" className="cta">Listen</Link>
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
    </div>
  );
};

export default ResourcesPage;