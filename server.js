const express = require('express');
const session = require('express-session');
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const accountRoutes = require("./routes/account-routes");
const watchListRoutes = require("./routes/watchlist-routes");
const moviereviewsRoutes = require("./routes/moviereviews-routes");
const app = express();
const path = require('path');
const { getPopularMovies, clearPopularMoviesCache } = require("./data/movies");
const { connectDB } = require("./data/mongo");

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false
}));
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.currentUser = req.session.currentUser || null;
    next(); 
});

app.use("/", loginRoutes);  
app.use("/", registerRoutes);
app.use("/", accountRoutes);
app.use("/", moviereviewsRoutes);
app.use('/watchlist', watchListRoutes);

function startServer() {
  const hostname = "localhost";
  const port = 8000;
  app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

connectDB()
  .then(() => {
    console.log("MongoDB connected");
    startServer();
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });


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