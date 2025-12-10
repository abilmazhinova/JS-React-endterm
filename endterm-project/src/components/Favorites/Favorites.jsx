import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchShowDetails } from '../../services/apiService';
import useFavorites from '../../hooks/useFavorites';
import './Favorites.css';

const Favorites = () => {
  const { 
    favorites, 
    loading, 
    error, 
    mergeMessage,
    favoritesCount,
    isGuest,
    hasLocalFavorites,
    mergeWithServer,
    clearAllFavorites,
    removeFavorite 
  } = useFavorites();
  
  const [favoriteShows, setFavoriteShows] = useState([]);
  const [showsLoading, setShowsLoading] = useState(true);

  // ========== useMemo: производные значения ==========
  const hasFavorites = useMemo(() => favoritesCount > 0, [favoritesCount]);
  const showsWithImagesCount = useMemo(() => 
    favoriteShows.filter(show => show.image).length, 
    [favoriteShows]
  );

  const genresStats = useMemo(() => {
    const allGenres = favoriteShows.flatMap(show => show.genres || []);
    const genreCount = {};
    
    allGenres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
    
    return Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [favoriteShows]);

  // ========== useCallback: обработчики ==========
  const handleRemoveFavorite = useCallback(async (showId) => {
    await removeFavorite(showId);
  }, [removeFavorite]);

  const handleClearAll = useCallback(async () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      await clearAllFavorites();
    }
  }, [clearAllFavorites]);

  const handleMerge = useCallback(async () => {
    const result = await mergeWithServer();
    if (result.success) {
      alert(result.message);
    }
  }, [mergeWithServer]);

  // Загружаем детали каждого избранного шоу
  useEffect(() => {
    const loadFavoriteShows = async () => {
      if (favorites.length === 0) {
        setFavoriteShows([]);
        setShowsLoading(false);
        return;
      }

      try {
        setShowsLoading(true);
        const showsPromises = favorites.map(id => fetchShowDetails(id));
        const shows = await Promise.all(showsPromises);
        setFavoriteShows(shows.filter(show => show !== null));
      } catch (err) {
        console.error('Error loading favorite shows:', err);
      } finally {
        setShowsLoading(false);
      }
    };

    loadFavoriteShows();
  }, [favorites]);

  if (loading || showsLoading) {
    return (
      <div className="favorites-container">
        <div className="loading-spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>My Favorite Shows</h1>
        
        {/* Статистика с useMemo */}
        <div className="favorites-stats">
          <span className="stats-count">{favoritesCount} shows</span>
          {showsWithImagesCount > 0 && (
            <span className="stats-images">{showsWithImagesCount} with images</span>
          )}
          {genresStats.length > 0 && (
            <span className="stats-genres">
              Top genre: {genresStats[0]?.[0] || 'None'}
            </span>
          )}
          {isGuest && (
            <span className="stats-guest">(Saved locally)</span>
          )}
        </div>

        {mergeMessage && (
          <div className="merge-message">
            <span className="merge-icon">🔄</span>
            <p>{mergeMessage}</p>
            {hasLocalFavorites && !isGuest && (
              <button onClick={handleMerge} className="merge-btn">
                Merge Now
              </button>
            )}
          </div>
        )}

        {isGuest && hasLocalFavorites && (
          <div className="guest-notice">
            <p>
              <strong>⚠️ Guest User:</strong> Your favorites are saved locally. 
              <Link to="/login" className="login-link"> Log in</Link> to save them to your account.
            </p>
          </div>
        )}

        {hasFavorites && (
          <div className="favorites-actions">
            <button 
              onClick={handleClearAll}
              className="clear-all-btn"
              disabled={showsLoading}
            >
              Clear All Favorites
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!hasFavorites ? (
        <div className="empty-favorites">
          <div className="empty-icon">⭐</div>
          <h2>No favorite shows yet</h2>
          <p>Start adding shows to your favorites by clicking the heart icon on any show.</p>
          <Link to="/movies" className="browse-btn">
            Browse Shows
          </Link>
        </div>
      ) : (
        <>
          <div className="favorites-grid">
            {favoriteShows.map((show) => (
              <FavoriteCard 
                key={show.id} 
                show={show} 
                onRemove={handleRemoveFavorite}
              />
            ))}
          </div>

          <div className="favorites-footer">
            <p>
              <strong>Tip:</strong> Your favorites are {isGuest ? 'saved in your browser' : 'synced with your account'}.
              {isGuest && ' Log in to access them from any device.'}
            </p>
            {/* Дополнительная статистика */}
            {genresStats.length > 0 && (
              <div className="genres-summary">
                <strong>Your favorite genres:</strong>
                {genresStats.map(([genre, count]) => (
                  <span key={genre} className="genre-stat">
                    {genre} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ========== Отдельный компонент для карточки с React.memo ==========
const FavoriteCard = React.memo(({ show, onRemove }) => {
  // useMemo для форматирования жанров
  const formattedGenres = useMemo(() => {
    if (!show.genres || show.genres.length === 0) return 'No genres';
    return show.genres.slice(0, 2).join(', ') + (show.genres.length > 2 ? '...' : '');
  }, [show.genres]);

  // useCallback для обработчика удаления
  const handleRemove = useCallback(() => {
    onRemove(show.id);
  }, [show.id, onRemove]);

  return (
    <div className="favorite-card">
      <div className="favorite-card-header">
        <button
          onClick={handleRemove}
          className="remove-favorite-btn"
          title="Remove from favorites"
        >
          ❤️
        </button>
        <span className="favorite-badge">Favorite</span>
      </div>
      
      <Link to={`/movies/${show.id}`} className="favorite-link">
        <img
          src={show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image'}
          alt={show.name}
          className="favorite-image"
        />
        <div className="favorite-content">
          <h3>{show.name}</h3>
          <div className="favorite-genres">
            {show.genres?.slice(0, 2).map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
          <p className="favorite-rating">
            ⭐ {show.rating?.average || 'N/A'}
          </p>
          <p className="favorite-summary">
            {formattedGenres}
          </p>
        </div>
      </Link>
    </div>
  );
});

export default Favorites;