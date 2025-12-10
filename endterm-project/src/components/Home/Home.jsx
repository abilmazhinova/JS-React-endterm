import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleExploreShows = () => {
    navigate('/movies');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to TVMaze API Explorer</h1>
        <p>Discover amazing TV shows with us!</p>
        
        <div className="home-stats">
          <div className="stat">
            <h3>1000+</h3>
            <p>TV Shows</p>
          </div>
          <div className="stat">
            <h3>50+</h3>
            <p>Genres</p>
          </div>
          <div className="stat">
            <h3>24/7</h3>
            <p>Updated</p>
          </div>
        </div>
        
        <button 
          className="explore-btn"
          onClick={handleExploreShows}
        >
          Explore Shows
        </button>
      </div>
      
    </div>
  );
};

export default Home;