import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About This Project</h1>

        <div className="about-card">
          <h2>End-Term React Project</h2>
          <p>
            This is a end-term project for the JS React course. 
            The application demonstrates modern React development practices 
            including authentication, API integration, state management, 
            and PWA capabilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
