const express = require('express');
const session = require('express-session');
const dotenv = require("dotenv");
const mongoose = require('mongoose');

const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const accountRoutes = require("./routes/account-routes");
const watchListRoutes = require("./routes/watchlist-routes");
const moviereviewsRoutes = require("./routes/moviereviews-routes");
const app = express();
const path = require('path');
const { getPopularMovies, clearPopularMoviesCache } = require("./data/movies");

app.set("view engine", "ejs");
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
app.use('/watchlist', watchListRoutes);

//Routes
app.get("/", async (req, res) => {
  const movies = await getPopularMovies();
  res.render("home", { movies });
});

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


app.get("/", async (req, res) => {
  const movies = await getPopularMovies();
  res.render("home", { movies });
});

app.post("/clear-movie-cache", async (req, res) => {
  try {
    await clearPopularMoviesCache();
    res.redirect("/");
  } catch (error) {
    console.log("Error clearing movie cache:", error);
    res.status(500).send("Failed to clear movie cache");
  }
});
