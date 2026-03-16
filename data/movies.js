const TMDB_API_KEY = "1a5d529ccb58f5db5d1c537364032cd0";
const BASE_URL = "https://api.themoviedb.org/3";

let cachedMovies = null; 

async function fetchAndCache() {
  if (cachedMovies) return cachedMovies;

  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
  const data = await response.json();

  cachedMovies = data.results.map(movie => ({
    id:          movie.id,
    title:       movie.title,
    rating:      movie.vote_average,
    releaseDate: movie.release_date,
    poster:      `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    overview:    movie.overview,
    genres:      movie.genre_ids,
  }));

  return cachedMovies;
}

// for home page 
async function getPopularMovies() {
  return await fetchAndCache();
}

// for movie page 
async function getMovieById(id) {
  const movies = await fetchAndCache();
  const cached = movies.find(m => m.id === parseInt(id));
  if (cached) return cached;

  // if not in cache 
  const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`);
  return await response.json();
}

// for search
async function searchMovies(query) {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.results.map(movie => ({
    id:          movie.id,
    title:       movie.title,
    rating:      movie.vote_average,
    releaseDate: movie.release_date,
    poster:      movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    overview:    movie.overview,
  }));
}

module.exports = { getPopularMovies, getMovieById, searchMovies };