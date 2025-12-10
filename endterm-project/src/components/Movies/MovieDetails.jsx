import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchShowDetails } from '../../services/apiService';
import useFavorites from '../../hooks/useFavorites';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  
  // Используем хук избранного
  const { 
    isFavorite, 
    toggleFavorite, 
    isGuest, 
    loading: favoritesLoading,
    favoritesCount 
  } = useFavorites();

  // Загрузка деталей шоу
  useEffect(() => {
    const loadShowDetails = async () => {
      try {
        const data = await fetchShowDetails(id);
        setShow(data);
        setError('');
      } catch (err) {
        setError('Failed to load show details');
      } finally {
        setLoading(false);
      }
    };

    loadShowDetails();
  }, [id]);

  // Обработчик добавления/удаления из избранного
  const handleFavoriteClick = useCallback(async () => {
    if (!show) return;
    
    const result = await toggleFavorite(show.id);
    
    if (result.success) {
      if (isFavorite(show.id)) {
        setActionMessage('Removed from favorites!');
      } else {
        setActionMessage('Added to favorites!');
      }
      
      // Автоматически скрываем сообщение через 3 секунды
      setTimeout(() => {
        setActionMessage('');
      }, 3000);
    }
  }, [show, isFavorite, toggleFavorite]);

  // Функция для очистки HTML тегов из summary
  const cleanSummary = (html) => {
    if (!html) return 'No description available';
    return html.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
  };

  // Загрузка
  if (loading || favoritesLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading show details...</p>
      </div>
    );
  }

  // Ошибка
  if (error) return <div className="error-message">{error}</div>;
  if (!show) return <div>Show not found</div>;

  // Определяем текст для кнопки избранного
  const getFavoriteButtonText = () => {
    if (isFavorite(show.id)) {
      return isGuest ? '❤️ Remove from Local Favorites' : '❤️ Remove from Favorites';
    } else {
      return isGuest ? '♡ Add to Local Favorites' : '♡ Add to Favorites';
    }
  };

  return (
    <div className="movie-details-container">
      {actionMessage && (
        <div className={`action-notification ${isFavorite(show.id) ? 'removed' : 'added'}`}>
          <span className="notification-icon">
            {isFavorite(show.id) ? '✓' : '❤️'}
          </span>
          {actionMessage}
          {isGuest && <span className="guest-note"> (Saved locally)</span>}
        </div>
      )}
      
      <div className="movie-details-card">
        <div className="movie-header">
          <img 
            src={show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image'} 
            alt={show.name}
            className="movie-poster"
          />
          
          <div className="movie-basic-info">
            <h1 className="movie-title">{show.name}</h1>
            
            <div className="movie-meta">
              <div className="meta-item">
                <span className="meta-label">⭐ Rating:</span>
                <span className="meta-value">{show.rating?.average || 'N/A'}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">📺 Type:</span>
                <span className="meta-value">{show.type || 'TV Show'}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">🏷️ Status:</span>
                <span className="meta-value">{show.status || 'Unknown'}</span>
              </div>
              
              <div className="meta-item">
                <span className="meta-label">🗣️ Language:</span>
                <span className="meta-value">{show.language || 'Unknown'}</span>
              </div>
            </div>
            
            <div className="genres-container">
              {show.genres && show.genres.length > 0 ? (
                show.genres.map((genre, index) => (
                  <span key={index} className="genre-tag">{genre}</span>
                ))
              ) : (
                <span className="genre-tag">No genres</span>
              )}
            </div>
            
            {/* Статус избранного */}
            <div className="favorites-status">
              <div className="status-item">
                <span className="status-label">Favorites Status:</span>
                <span className={`status-value ${isFavorite(show.id) ? 'favorite' : 'not-favorite'}`}>
                  {isFavorite(show.id) ? 'In your favorites' : 'Not in favorites'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Storage:</span>
                <span className="status-value storage">
                  {isGuest ? 'Local Storage' : 'Cloud Synced'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="movie-content">
          <div className="summary-section">
            <h3 className="section-title">Summary</h3>
            <p className="movie-description">{cleanSummary(show.summary)}</p>
          </div>
          
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Schedule:</span>
              <span className="detail-value">
                {show.schedule?.days?.join(', ') || 'Unknown'} at {show.schedule?.time || 'Unknown'}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Network:</span>
              <span className="detail-value">
                {show.network?.name || show.webChannel?.name || 'Unknown'}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Runtime:</span>
              <span className="detail-value">
                {show.runtime || 'Unknown'} minutes
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Premiered:</span>
              <span className="detail-value">
                {show.premiered || 'Unknown'}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Ended:</span>
              <span className="detail-value">
                {show.ended || 'Still running'}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Official Site:</span>
              <span className="detail-value">
                {show.officialSite ? (
                  <a href={show.officialSite} target="_blank" rel="noopener noreferrer" className="official-link">
                    Visit website
                  </a>
                ) : 'Not available'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="movie-actions">
          <Link to="/movies" className="back-btn">
            ← Back to Shows
          </Link>
          
          <button 
            className="external-btn"
            onClick={() => show.url && window.open(show.url, '_blank')}
          >
            View on TVMaze
          </button>
          
          <button 
            className={`favorite-btn ${isFavorite(show.id) ? 'active' : ''} ${isGuest ? 'guest' : ''}`}
            onClick={handleFavoriteClick}
            disabled={favoritesLoading}
          >
            {getFavoriteButtonText()}
            {isGuest && <span className="guest-indicator">(Local)</span>}
          </button>
        </div>
        
        {/* Гостевая подсказка */}
        {isGuest && (
          <div className="guest-tip">
            <p>
              <strong>💡 Tip:</strong> Your favorites are saved locally. 
              <Link to="/login" className="tip-link"> Log in</Link> to sync them with your account and access from any device.
            </p>
          </div>
        )}
        
        {/* Ссылка на список избранного */}
        <div className="favorites-link-section">
          <Link to="/favorites" className="view-favorites-link">
            View all your favorites ({favoritesCount} shows)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;