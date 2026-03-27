const dotenv = require("dotenv");
const { MovieCache, pushToDB, readOneFromDB, updateInDB, deleteFromDB } = require("./mongo");

dotenv.config({ path: "./config.env" });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const POPULAR_MOVIES_CACHE_KEY = "popular_movies";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

function normaliseMovie(movie) {
  return {
    id:          movie.id,
    title:       movie.title,
    rating:      movie.vote_average,
    releaseDate: movie.release_date,
    poster:      movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    overview:    movie.overview,
    genres:      movie.genre_ids || (movie.genres ? movie.genres.map(genre => genre.id) : []),
  };
}

function isCacheExpired(cacheEntry) {
  if (!cacheEntry) return true;
  if (!cacheEntry.updatedAt) return true;

  return Date.now() - new Date(cacheEntry.updatedAt).getTime() > CACHE_DURATION_MS;
}

async function fetchJson(url) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not configured.");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchAndCache() {
  const existingCache = await readOneFromDB(MovieCache, {
    cacheKey: POPULAR_MOVIES_CACHE_KEY
  });

  if (existingCache && existingCache.movies && existingCache.movies.length > 0 && !isCacheExpired(existingCache)) {
    return existingCache.movies;
  }

  const data = await fetchJson(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
  const movies = (data.results || []).map(movie => normaliseMovie(movie));

  if (existingCache) {
    await updateInDB(
      MovieCache,
      { cacheKey: POPULAR_MOVIES_CACHE_KEY },
      { movies: movies, updatedAt: new Date() }
    );
  } else {
    await pushToDB(MovieCache, {
      cacheKey: POPULAR_MOVIES_CACHE_KEY,
      movies: movies,
      updatedAt: new Date()
    });
  }

  return movies;
}

// for home page 
async function getPopularMovies() {
  return await fetchAndCache();
}

async function clearPopularMoviesCache() {
  return await deleteFromDB(MovieCache, {
    cacheKey: POPULAR_MOVIES_CACHE_KEY
  });
}

// for movie page 
async function getMovieById(id) {
  const movies = await fetchAndCache();
  const numericId = Number.parseInt(id, 10);
  const cached = movies.find(m => m.id === numericId);
  if (cached) return cached;

  // if not in cache 
  const movie = await fetchJson(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`);
  return normaliseMovie(movie);
}

// for search
async function searchMovies(query) {
  const data = await fetchJson(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
  return (data.results || []).map(movie => normaliseMovie(movie));
}

module.exports = {getPopularMovies, clearPopularMoviesCache, getMovieById, searchMovies };
