const express = require('express');
const app = express();
const path = require('path');
const { getPopularMovies } = require("./data/movies");
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

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