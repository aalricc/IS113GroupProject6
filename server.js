const express = require('express');
const session = require('express-session');
const dotenv = require("dotenv");
const mongoose = require('mongoose');

const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const accountRoutes = require("./routes/account-routes");
const watchListRoutes = require("./routes/watchlist-routes");
const moviereviewsRoutes = require("./routes/moviereviews-routes");
const adminRoutes = require('./routes/admin-routes');
const searchRoute = require("./routes/search-route");

const app = express();
const path = require('path');
const { getPopularMovies, clearPopularMoviesCache } = require("./data/movies");
const { getRecommendedMovies } = require("./data/recommendations");
const { MovieStats } = require("./models/moviestats-model");
dotenv.config({ path: "./config.env" });
app.set("view engine", "ejs");
 app.use(express.static('public', { index: false }));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.currentUser = req.session.currentUser || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

app.use("/", loginRoutes);  
app.use("/", registerRoutes);
app.use("/", accountRoutes);
app.use("/", moviereviewsRoutes);
app.use('/', adminRoutes);
app.use('/watchlist', watchListRoutes);
app.use('/', searchRoute);

async function attachUserRatingsToMovies(movies) {
  const movieIds = movies.map(movie => String(movie.id));
  const movieStats = await MovieStats.find({ movieId: { $in: movieIds } });
  const ratingsByMovieId = {};

  for (let stat of movieStats) {
    ratingsByMovieId[String(stat.movieId)] = stat.averageRating;
  }

  for (let movie of movies) {
    if (Object.prototype.hasOwnProperty.call(ratingsByMovieId, String(movie.id))) {
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
      recommendedMovies = await getRecommendedMovies(req.session.currentUser, movies);
    }

    res.render("home", { movies, recommendedMovies });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(500).send("Failed to load home page");
  }
}

//Routes
app.get("/", renderHomePage);

async function connectDB() {
    try {
        await mongoose.connect(process.env.DB);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};


function startServer() {
  const hostname = "localhost";
  const port = 8000;
  app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

connectDB().then(startServer);

app.post("/clear-movie-cache", async (req, res) => {
  try {
    await clearPopularMoviesCache();
    res.redirect("/");
  } catch (error) {
    console.log("Error clearing movie cache:", error);
    res.status(500).send("Failed to clear movie cache");
  }
});
