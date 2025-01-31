import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addToFavorites, removeFromFavorites } from "../../store/Slices/favorites";
import "../Styles/MovieDetails.css";

const API_KEY = "1f54bd990f1cdfb230adb312546d765d";
const BASE_URL = "https://api.themoviedb.org/3";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.movies);
  const isFavorite = favorites.some((m) => m?.id === Number(id));

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch movie details
        const movieResponse = await axios.get(
          `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
        );
        setMovie(movieResponse.data);

        // Fetch cast
        const creditsResponse = await axios.get(
          `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
        );
        setCast(creditsResponse.data.cast.slice(0, 6));

        // Fetch trailer
        const videosResponse = await axios.get(
          `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`
        );
        const trailer = videosResponse.data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch movie details");
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(Number(id)));
    } else {
      dispatch(addToFavorites(movie));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!movie) {
    return <div className="error-container">Movie not found</div>;
  }

  return (
    <div className="movie-details-container">
      <div className="hero-section">
        <div className="hero-background">
          {trailerKey ? (
            <div className="trailer-container">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&showinfo=0`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <button 
                className="mute-toggle"
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
              >
                {isMuted ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div 
              className="backdrop-image"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
              }}
            />
          )}
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="movie-poster">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
              </div>
              <div className="movie-info">
                <h1>{movie.title}</h1>
                <div className="movie-meta">
                  <span className="release-date">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                  <span className="runtime">{movie.runtime} min</span>
                  <span className="rating">★ {movie.vote_average.toFixed(1)}</span>
                </div>
                <div className="genres">
                  {movie.genres.map(genre => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
                <p className="tagline">{movie.tagline}</p>
                <div className="overview">
                  <h3>Overview</h3>
                  <p>{movie.overview}</p>
                </div>
                <div className="action-buttons">
                  <button 
                    className={`favorite-button ${isFavorite ? 'active' : ''}`}
                    onClick={handleFavoriteClick}
                  >
                    <svg viewBox="0 0 24 24" className="heart-icon">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="details-section">
        <div className="container">
          <div className="movie-stats">
            <div className="stat-card">
              <h4>Status</h4>
              <p>{movie.status}</p>
            </div>
            <div className="stat-card">
              <h4>Budget</h4>
              <p>₹{(movie.budget * 83.16).toLocaleString('en-IN')}</p>
            </div>
            <div className="stat-card">
              <h4>Revenue</h4>
              <p>₹{(movie.revenue * 83.16).toLocaleString('en-IN')}</p>
            </div>
            <div className="stat-card">
              <h4>Original Language</h4>
              <p>{movie.original_language.toUpperCase()}</p>
            </div>
          </div>

          <div className="cast-section">
            <h2>Featured Cast</h2>
            <div className="cast-grid">
              {cast.map(person => (
                <div key={person.id} className="cast-card">
                  <div className="cast-image">
                    <img
                      src={person.profile_path 
                        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                        : 'https://via.placeholder.com/185x278?text=No+Image'
                      }
                      alt={person.name}
                    />
                  </div>
                  <div className="cast-info">
                    <h4>{person.name}</h4>
                    <p>{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="production-section">
            <h2>Production Companies</h2>
            <div className="companies-list">
              {movie.production_companies.map(company => (
                <div key={company.id} className="company-item">
                  {company.logo_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                      alt={company.name}
                    />
                  ) : (
                    <span className="company-name">{company.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
