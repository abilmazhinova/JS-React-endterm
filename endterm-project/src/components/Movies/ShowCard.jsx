import React from 'react';
import { Link } from 'react-router-dom';
import './MovieDetails.css'; // Или отдельный Card.css

const ShowCard = ({ show }) => {
  return (
    <div className="show-card">
      <img 
        src={show.image?.medium || 'https://via.placeholder.com/300x400?text=No+Image'} 
        alt={show.name}
        className="show-card-image"
      />

      <h3 className="show-card-title">{show.name}</h3>

      <div className="show-card-genres">
        {show.genres?.slice(0, 3).map((genre, index) => (
          <span key={index} className="show-card-genre">{genre}</span>
        ))}
      </div>

      <Link to={`/movies/${show.id}`} className="show-card-link">
        View details
      </Link>
    </div>
  );
};


export default ShowCard;