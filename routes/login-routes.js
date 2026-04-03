const express = require("express");
const loginController = require(".././controllers/login-controller");

const router = express.Router();

router.get("/login", loginController.showLoginPage);
router.post("/login-attempt", loginController.loginAttempt);
router.get("/logout", loginController.logout);
router.get("/login-attempt", loginController.loginGetAttempt);

module.exports = router;
