const express = require('express');
const app = express();
const path = require('path');

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

let userDatabase = [{username: "dylan", password: "123456"}];

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
    // mongoDB to check for username in userDatabase

    // below is a test for user trying to log in
    for (let user of userDatabase){
        if (!user.username.includes(usernameEntered) && user.password === passwordEntered){
            falseLogin = false;
            break
        }
    }

    if (falseLogin === true){
        res.redirect("/home");
        
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

    // username validation
    if (!usernameRegister || usernameRegister.trim() === "") {
        errors.push("Username cannot be empty");
    }

    if (usernameRegister.length < 3) {
        errors.push("Username must be at least 3 characters");
    }

    // email validation
    if (!emailRegex.test(emailRegister)) {
        errors.push("Invalid email format");
    }

    // password validation
    if (passwordRegister.length < 6) {
        errors.push("Password must be at least 6 characters");
    }


    // password matches validation
    if (passwordRegister !== confirmPasswordRegister) {
        errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
        return res.render("register", {
            errors,
            isLoggedIn: false
        })
    } else {
        res.redirect("/home");
    }
})


app.get("/movies_review",(req,res) => {
    res.render("moviereviews",{

    })
})
const hostname = "localhost";
const port = 8000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
