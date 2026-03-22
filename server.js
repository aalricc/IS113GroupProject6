const express = require('express');
const session = require('express-session');
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const accountRoutes = require("./routes/account-routes");
const watchListRoutes = require("./routes/watchlist-routes");

const app = express();
const path = require('path');
const { getPopularMovies, clearPopularMoviesCache } = require("./data/movies");
const { connectDB } = require("./data/mongo");
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

// secret: signs the session cookie
// resave: false: avoids saving unchanged sessions
// saveUninitialized: false: don’t create empty sessions for everyone
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

// use routes
app.use("/", loginRoutes);  
app.use("/", registerRoutes);
app.use("/", accountRoutes);

function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = 8000;// Define port number
 
  // Start the server and listen on the specified hostname and port
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


//Routes
const moviereviewsRoutes = require("./routes/moviereviews-routes")
app.use("/", moviereviewsRoutes);
const homeRoutes = require("./routes/home-routes")
app.use("/", homeRoutes);
const loginRoutes = require("./routes/login-routes")
app.use("/", loginRoutes);
const watchlistRoutes = require("./routes/watchlist-routes")
app.use("/", watchlistRoutes);
const registerRoutes = require("./routes/register-routes")
app.use("/", registerRoutes);
let userDatabase = [{username: "dylan", password: "123456"}];
let movies = [
    {title: "The Shawshank Redemption", review: "9.3", date:"3/9/2026", isWatched:"Yes"},
    {title: "Pulp Fiction", review: "8.3", date: "3/9/2026", isWatched:"Yes"},
    {title: "The Dark Knight", review: "8.3", date: "3/9/2026", isWatched:"No"}
]

app.use('/watchlist', watchListRoutes);

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
