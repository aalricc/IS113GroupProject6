const express = require('express');
const app = express();
const path = require('path');
const { getPopularMovies } = require("./data/movies");
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

// Routes
const moviereviewsRoutes = require('./routes/moviereviews-routes');
app.use('/', moviereviewsRoutes);

//TMDB API
const TMDB_API_KEY = "1a5d529ccb58f5db5d1c537364032cd0"; 

async function loadPopularMovies() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results.map(movie => ({
    title:       movie.title,
    rating:      movie.vote_average,
    releaseDate: movie.release_date,
    poster:      `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    overview:    movie.overview,
  }));
}

//Routes
let userDatabase = [{username: "dylan", password: "123456"}];
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

app.get("/login-page", (req, res)=>{
    res.render("login", {
        isLoggedIn: false,
        falseLogin: null
    })
})

app.get("/register-page", (req, res)=>{
    res.render("register", {
        isLoggedIn: false
    })
})

app.post('/login-attempt', (req, res)=>{
    const usernameEntered = req.body.usernameEntered;
    const passwordEntered = req.body.passwordEntered;
    let falseLogin = true;

    for (let user of userDatabase){
        if (!user.username.includes(usernameEntered) && user.password === passwordEntered){
            falseLogin = false;
            break
        }
    }

    if (falseLogin === true){
        res.redirect("/");
    } else {
        res.render("login", {
            isLoggedIn: false,
            falseLogin
        })
    }
})

app.post("/register-attempt", (req, res)=>{
    const usernameRegister = req.body.usernameRegister;
    const emailRegister = req.body.emailRegister;
    const passwordRegister = req.body.passwordRegister;
    const confirmPasswordRegister = req.body.confirmPasswordRegister;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errors = [];

    if (!usernameRegister || usernameRegister.trim() === "") {
        errors.push("Username cannot be empty");
    }
    if (usernameRegister.length < 3) {
        errors.push("Username must be at least 3 characters");
    }
    if (!emailRegex.test(emailRegister)) {
        errors.push("Invalid email format");
    }
    if (passwordRegister.length < 6) {
        errors.push("Password must be at least 6 characters");
    }
    if (passwordRegister !== confirmPasswordRegister) {
        errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
        return res.render("register", {
            errors,
            isLoggedIn: false
        })
    } else {
        res.redirect("/");
    }
})


const hostname = "localhost";
const port = 8000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
