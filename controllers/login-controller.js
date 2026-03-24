
const fs = require('fs/promises');
const User = require(".././models/user");
const bcrypt = require('bcrypt');

exports.showLoginPage = (req, res) => {
    res.render("login", {
    falseLogin: null,
    isLoggedIn: req.session.isLoggedIn || false
    });
};

exports.loginAttempt = async (req, res) => {
    const usernameEntered = req.body.usernameEntered;
    const passwordEntered = req.body.passwordEntered;

    try {
        const user = await User.findOneUsername(usernameEntered);

        // user not found or user found but password dont match
        if (!user){
            return res.render("login", {
                falseLogin: true,
                isLoggedIn: req.session.isLoggedIn || false
            });
        }

        const match = await bcrypt.compare(passwordEntered, user.password);
        if (!match){
            return res.render("login", {
                falseLogin: true,
                isLoggedIn: req.session.isLoggedIn || false
            });
        }

        req.session.isLoggedIn = true;
        req.session.currentUser = {
            id: user._id,
            username: user.username
        };

        if (user.role === "admin"){
            req.session.isAdmin = true;
        }

        return res.redirect("/");
    } catch (error) {
        console.error("Login failed", error.message)
        return res.status(500).send("Server Error 500");
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err)=> {
        if (err) {
            console.log(`Logout error: ${err}`);
            return res.status(500).send("Could not logout");
        }

        res.redirect("/");
    });
}
