const User = require(".././models/user");
const bcrypt = require("bcrypt");

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME_MS = 60 * 1000;

exports.showLoginPage = (req, res) => {
  res.render("login", {
    falseLogin: null,
    isLoggedIn: req.session.isLoggedIn || false,
    triesLeft: null,
    isLocked: false,
  });
};
exports.loginGetAttempt = (req, res) => {
  res.redirect("/login");
};

exports.loginAttempt = async (req, res) => {
  const usernameEntered = req.body.usernameEntered;
  const passwordEntered = req.body.passwordEntered;

  try {
    const user = await User.findOneUsername(usernameEntered);

    // user not found
    if (!user) {
      return res.render("login", {
        falseLogin: true,
        isLoggedIn: req.session.isLoggedIn || false,
        isLocked: false,
        triesLeft: null,
      });
    }

    // check whether account is locked
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      return res.render("login", {
        falseLogin: null,
        isLoggedIn: req.session.isLoggedIn || false,
        triesLeft: 0,
        isLocked: true,
      });
    }

    // if lock expired, reset it before continuing
    if (user.lockUntil && user.lockUntil.getTime() <= Date.now()) {
      user.loginAttempt = 0;
      user.lockUntil = null;
      await user.save();
    }

    const match = await bcrypt.compare(passwordEntered, user.password);

    // valid username but password wrong
    if (!match) {
      user.loginAttempt += 1;

      if (user.loginAttempt >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      }

      await user.save();

      const triesLeft = Math.max(0, MAX_LOGIN_ATTEMPTS - user.loginAttempt);
      const isLocked = !!(
        user.lockUntil && Date.now() < user.lockUntil.getTime()
      );

      return res.render("login", {
        falseLogin: null,
        isLoggedIn: req.session.isLoggedIn || false,
        triesLeft,
        isLocked,
      });
    }

    // correct password and username
    // reset loginAttempt and lockUntil
    user.loginAttempt = 0;
    user.lockUntil = null;
    await user.save();

    req.session.isLoggedIn = true;
    req.session.currentUser = {
      id: user._id,
      username: user.username,
    };

    if (user.role === "admin") {
      req.session.isAdmin = true;
    } else {
      req.session.isAdmin = false;
    }

    return res.redirect("/home");
  } catch (error) {
    console.error("Login failed", error.message);
    return res.status(500).send("Server Error 500");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(`Logout error: ${err}`);
      return res.status(500).send("Could not logout");
    }

    res.redirect("/home");
  });
};
