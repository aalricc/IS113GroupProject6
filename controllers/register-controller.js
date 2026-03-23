const User = require('.././models/user');
const bcrypt = require('bcrypt');

exports.showRegisterPage = (req, res) => {
    res.render("register", {
        errors: []
    });
};

exports.registerAttempt = async (req, res) => {
    const usernameRegister = req.body.usernameRegister;
    const emailRegister = req.body.emailRegister;
    let passwordRegister = req.body.passwordRegister;
    const confirmPasswordRegister = req.body.confirmPasswordRegister;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errors = [];

    if (!usernameRegister || usernameRegister.trim() === "") {
        errors.push("Username cannot be empty");
    }

    if (usernameRegister && usernameRegister.length < 3) {
        errors.push("Username must be at least 3 characters");
    }

    if (!emailRegex.test(emailRegister)) {
        errors.push("Invalid email format");
    }

    if (!passwordRegister || passwordRegister.length < 6) {
        errors.push("Password must be at least 6 characters");
    }

    if (passwordRegister !== confirmPasswordRegister) {
        errors.push("Passwords do not match");
    }

    try {
        const existingUser = await User.findOneUsername(usernameRegister);

        if (existingUser) {
            errors.push("Username already exists");
        }

        if (errors.length > 0) {
            return res.render("register", {
                errors
            });
        }

        passwordRegister = await bcrypt.hash(passwordRegister, 10);
        await User.createUser({
            username: usernameRegister,
            email: emailRegister,
            password: passwordRegister
        });

        return res.redirect("/login");
    } catch (error) {
        console.log("Register error:", error);
        return res.status(500).send("Server error");
    }
};
