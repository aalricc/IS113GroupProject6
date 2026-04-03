const dotenv = require("dotenv");
const {
  MovieCache,
  pushToDB,
  readOneFromDB,
  updateInDB,
  deleteFromDB,
} = require("./mongo");

dotenv.config({ path: "./config.env" });

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const POPULAR_MOVIES_CACHE_KEY = "popular_movies";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

function normaliseMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    rating: movie.vote_average,
    releaseDate: movie.release_date,
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    overview: movie.overview,
    genres:
      movie.genre_ids ||
      (movie.genres ? movie.genres.map((genre) => genre.id) : []),
  };
}

function isCacheExpired(cacheEntry) {
  if (!cacheEntry) return true;
  if (!cacheEntry.updatedAt) return true;

  return (
    Date.now() - new Date(cacheEntry.updatedAt).getTime() > CACHE_DURATION_MS
  );
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
    cacheKey: POPULAR_MOVIES_CACHE_KEY,
  });

  if (
    existingCache &&
    existingCache.movies &&
    existingCache.movies.length > 0 &&
    !isCacheExpired(existingCache)
  ) {
    return existingCache.movies;
  }

  const data = await fetchJson(
    `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
  );
  const movies = (data.results || []).map((movie) => normaliseMovie(movie));

  if (existingCache) {
    await updateInDB(
      MovieCache,
      { cacheKey: POPULAR_MOVIES_CACHE_KEY },
      {
        movies: movies,
        source: "tmdb",
        movieCount: movies.length,
        updatedAt: new Date(),
      },
    );
  } else {
    await pushToDB(MovieCache, {
      cacheKey: POPULAR_MOVIES_CACHE_KEY,
      movies: movies,
      source: "tmdb",
      movieCount: movies.length,
      updatedAt: new Date(),
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
    cacheKey: POPULAR_MOVIES_CACHE_KEY,
  });
}

async function getMovieById(id) {
  if (Number.parseInt(id, 10) === 123456789) {
    return {
      id: 123456789,
      title: "Prof Koh Kwan Chin: The Legend of Lecture Theatre 3",
      rating: 10,
      releaseDate: "2026-04-03",
      poster: "http://lucasleow.com/share/P_B0VhBZegkmBXFu9aoZrQ",
      overview:
        "In a world where lectures are usually just slides… one man dares to turn every class into a full-on performance. Meet Prof Koh Kwan Chin — part educator, part stand-up comedian, part life coach you didn't know you needed. By day, he teaches. By… also day, he teaches — but somehow makes it feel like a Netflix special.",
      genres: [35],
    };
  }
  if (Number.parseInt(id, 10) === 987654321) {
    return {
      id: 987654321,
      title: "Joelle: Calm, Collected, and Slightly Savage",
      rating: 9.8,
      releaseDate: "2026-04-03",
      poster: "http://lucasleow.com/share/9-IZP2CgS-Kaj-zQLSEKWQ",
      overview:
        "In a classroom full of chaos, confusion, and “uhhh I don’t get it” …one instructor remains unshaken. Meet Joelle — composed, sharp, and effortlessly in control. She doesn’t need to raise her voice. She doesn’t need dramatic energy. She just… stands there… explains once… and suddenly everyone realises they should’ve been paying attention from the start.",
      genres: [35],
    };
  }
  const movies = await fetchAndCache();
  const numericId = Number.parseInt(id, 10);
  const cached = movies.find((m) => m.id === numericId);
  if (cached) return cached;

  const movie = await fetchJson(
    `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`,
  );
  return normaliseMovie(movie);
}
// for search
async function searchMovies(query) {
  const data = await fetchJson(
    `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
  );
  return (data.results || []).map((movie) => normaliseMovie(movie));
}

async function getMovieTrailer(movieName, movieId) {
  try {
    let trailerMovieId = movieId;

    if (!trailerMovieId && movieName) {
      const matches = await searchMovies(movieName);
      if (matches.length > 0) {
        trailerMovieId = matches[0].id;
      }
    }

    if (!trailerMovieId) {
      return null;
    }

    const data = await fetchJson(
      `${BASE_URL}/movie/${trailerMovieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`,
    );
    const videos = data.results || [];
    const trailer =
      videos.find(
        (video) =>
          video.site === "YouTube" &&
          video.type === "Trailer" &&
          video.official,
      ) ||
      videos.find(
        (video) => video.site === "YouTube" && video.type === "Trailer",
      ) ||
      videos.find((video) => video.site === "YouTube");

    if (!trailer) {
      return null;
    }

    return {
      trailerName: trailer.name,
      youtubeKey: trailer.key,
    };
  } catch (error) {
    console.error("Error fetching movie trailer:", error.message);
    return null;
  }
}

module.exports = {
  getPopularMovies,
  clearPopularMoviesCache,
  getMovieById,
  searchMovies,
  getMovieTrailer,
};
