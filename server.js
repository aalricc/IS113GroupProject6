const express = require('express');
const session = require('express-session');
const dotenv = require("dotenv");
const mongoose = require('mongoose');

const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const accountRoutes = require("./routes/account-routes");
const watchListRoutes = require('./routes/watchlist-routes');
const moviereviewsRoutes = require('./routes/moviereviews-routes');
const adminRoutes = require('./routes/admin-routes');

dotenv.config({path: "./config.env"});

const app = express();
const path = require('path');
const { getPopularMovies } = require("./data/movies");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// secret: signs the session cookie
// resave: false: avoids saving unchanged sessions
// saveUninitialized: false: don’t create empty sessions for everyone
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.currentUser = req.session.currentUser || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

// use routes
app.use("/", loginRoutes);
app.use("/", registerRoutes);
app.use("/", accountRoutes);
app.use("/", adminRoutes);
app.use('/', moviereviewsRoutes);
app.use('/watchlist', watchListRoutes);

//Routes
let movies = [
    {title: "The Shawshank Redemption", review: "9.3", date:"3/9/2026", isWatched:"Yes"},
    {title: "Pulp Fiction", review: "8.3", date: "3/9/2026", isWatched:"Yes"},
    {title: "The Dark Knight", review: "8.3", date: "3/9/2026", isWatched:"No"}
]


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
  const hostname = "localhost"; // Define server hostname
  const port = 8000; // Define port number

  // Start the server and listen on the specified hostname and port
  app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

connectDB().then(startServer);

