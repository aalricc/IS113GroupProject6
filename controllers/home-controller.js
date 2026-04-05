const {
  getPopularMovies,
  clearPopularMoviesCache,
  getMovieById,
} = require("../data/movies");
const { getRecommendedMovies } = require("../data/recommendations");
const { MovieStats } = require("../models/moviestats-model");

async function attachUserRatingsToMovies(movies) {
  const movieIds = movies.map((movie) => String(movie.id));
  const movieStats = await MovieStats.find({ movieId: { $in: movieIds } });
  const ratingsByMovieId = {};

  for (let stat of movieStats) {
    ratingsByMovieId[String(stat.movieId)] = stat.averageRating;
  }

  for (let movie of movies) {
    if (
      Object.prototype.hasOwnProperty.call(ratingsByMovieId, String(movie.id))
    ) {
      movie.userRating = ratingsByMovieId[String(movie.id)];
    } else {
      movie.userRating = null;
    }
  }

  return movies;
}

async function renderHomePage(req, res) {
  try {
    let movies = await getPopularMovies();
    movies = await attachUserRatingsToMovies(movies);
    let recommendedMovies = [];

    if (req.session.isLoggedIn && req.session.currentUser) {
      recommendedMovies = await getRecommendedMovies(
        req.session.currentUser,
        movies,
      );
    }

    const featured1 = await getMovieById(123456789);
    const featured2 = await getMovieById(987654321);
    featured1.recommendationScore = 9999;
    featured2.recommendationScore = 9998;

    recommendedMovies = recommendedMovies.filter(
      (m) => m.id !== 123456789 && m.id !== 987654321,
    );
    recommendedMovies.push(featured1, featured2);

    recommendedMovies.sort((a, b) => {
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    recommendedMovies = recommendedMovies.slice(0, 6);

    res.render("home", { movies, recommendedMovies });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(500).send("Failed to load home page");
  }
}

async function clearMovieCache(req, res) {
  try {
    await clearPopularMoviesCache();
    res.redirect("/home");
  } catch (error) {
    console.log("Error clearing movie cache:", error);
    res.status(500).send("Failed to clear movie cache");
  }
}

module.exports = { renderHomePage, clearMovieCache };
