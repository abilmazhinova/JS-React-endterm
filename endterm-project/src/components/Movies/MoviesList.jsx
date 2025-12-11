import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchShows, searchShows } from '../../services/apiService';
import { useDebounce } from '../../hooks/useDebounce';
import ShowCard from './ShowCard';
import { useSearchParams } from 'react-router-dom';
import './Movies.css';

const MoviesList = () => {
  const [shows, setShows] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  const [page, setPage] = useState(0); // Для пагинации
  const [selectedGenre, setSelectedGenre] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || ""; 
  const [searchTerm, setSearchTerm] = useState(q);
  const debouncedSearch = useDebounce(searchTerm, 500); 

  // ========== useMemo: фильтрация по жанру ==========
  const filteredShows = useMemo(() => {
    if (!selectedGenre) return shows;
    return shows.filter(show => show.genres?.some(genre => genre.toLowerCase().includes(selectedGenre.toLowerCase())));
  }, [shows, selectedGenre]);

  // ========== useMemo: пагинация ==========
  const paginatedShows = useMemo(() => {
    if (!q && !selectedGenre) {
      const start = page * 20;
      return shows.slice(start, start + 20);
    }
    return filteredShows;
  }, [shows, page, q, selectedGenre, filteredShows]);

  // ========== Callbacks ==========
  const loadShows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchShows(page);
      setShows(data.slice(0, 100)); // Ограничиваем количество шоу
      setError('');
    } catch {
      setError('Failed to load TV shows');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const handleSearch = useCallback(async (query) => {
    setLoading(true);
    try {
      const data = await searchShows(query);
      setShows(data);
      setError('');
    } catch {
      setError('Failed to search shows');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setSelectedGenre('');
  }, []);

  const handleGenreSelect = useCallback((genre) => {
    setSelectedGenre(selectedGenre === genre ? '' : genre);
    setSearchTerm('');
    setSearchParams({});
  }, [selectedGenre, setSearchParams]);

  const handlePreviousPage = useCallback(() => setPage(prev => Math.max(0, prev - 1)), []);
  const handleNextPage = useCallback(() => setPage(prev => prev + 1), []);

  // ========== useEffect ==========
  useEffect(() => { if (!q) loadShows(); }, [page, q, loadShows]);
  useEffect(() => { if (q) handleSearch(q); }, []);
  useEffect(() => {
    if (debouncedSearch) {
      setSearchParams({ q: debouncedSearch });
      handleSearch(debouncedSearch);
    } else if (debouncedSearch === '') {
      setSearchParams({});
      loadShows();
    }
  }, [debouncedSearch, setSearchParams, handleSearch, loadShows]);
  useEffect(() => { if (q || selectedGenre) setPage(0); }, [q, selectedGenre]);

  return (
    <div className="movies-container">
      <div className="movies-header">
        <h1>TV Shows</h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search TV shows..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading shows...</p>
        </div>
      ) : (
        <>
          {(q || selectedGenre) && (
            <div className="active-filters">
              {q && <span className="active-filter">Search: "{q}" <button onClick={() => {setSearchTerm(''); setSearchParams({});}} className="clear-filter">✕</button></span>}
              {selectedGenre && <span className="active-filter">Genre: {selectedGenre} <button onClick={() => setSelectedGenre('')} className="clear-filter">✕</button></span>}
            </div>
          )}

          <div className="shows-grid">
            {paginatedShows.map(show => <ShowCard key={show.id} show={show} />)}
          </div>

          {paginatedShows.length === 0 && !loading && <div className="no-results"><p>No TV shows found. Try a different search or filter.</p></div>}

          {!q && !selectedGenre && (
            <div className="pagination">
              <button onClick={handlePreviousPage} disabled={page === 0}>← Previous</button>
              <div className="page-info">
                <span>Page {page + 1}</span>
                <span className="page-stats">Showing {Math.min(paginatedShows.length, 20)} of {shows.length} shows</span>
              </div>
              <button onClick={handleNextPage}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoviesList;
