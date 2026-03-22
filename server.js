const express = require('express');
const session = require('express-session');
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const accountRoutes = require("./routes/account-routes");

const app = express();
const path = require('path');
const { getPopularMovies } = require("./data/movies");
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

connectDB()
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });



//Routes
let movies = [
    {title: "The Shawshank Redemption", review: "9.3", date:"3/9/2026", isWatched:"Yes"},
    {title: "Pulp Fiction", review: "8.3", date: "3/9/2026", isWatched:"Yes"},
    {title: "The Dark Knight", review: "8.3", date: "3/9/2026", isWatched:"No"}
]

app.get("/watchlist", (req, res) => {
    res.render("watchlist", {movies})
})

// This function is to mark movies as "Watched"
app.post("/markWatched", (req, res) => {

    const name = req.body.movie
    
    // Go through the list of movies in movies object. If movie name from  POST submission is equal to movie name in object,
    // Update movie's isWatched property to "Yes"
    for(let movie of movies) {
        if(movie.title == name) {
            movie.isWatched = "Yes"
        }
    }

    res.redirect("/watchlist")
})

//This function is to remove a movie
app.post("/removeMovie", (req, res) => {
  
    let newMovies = []

    const name = req.body.movie
    console.log(name)

    //Go through the list of movies in movies object. If movie name from POST submission is not equal to movie name in object,
    //Add the movie to the new newMovies list. This list will have the movies without the one the user has removed.
    for (let movie of movies) {
        if (movie.title != name) {
            newMovies.push(movie)
        }
    }

    // Set original movies list to newMovies list
    movies = newMovies;

    res.redirect("/watchlist")
})

app.get("/", async (req, res) => {
  const movies = await getPopularMovies();
  res.render("home", { movies });
});

const hostname = "localhost";
const port = 3000;
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
