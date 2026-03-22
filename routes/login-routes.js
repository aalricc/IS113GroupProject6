const express = require("express");
const loginController = require(".././controllers/login-controller");

const router = express.Router();

const router = express.Router();

router.get("/login", loginController.someFunction);

router.post("/login-attempt", loginController.someFunction);
router.get("/login", loginController.showLoginPage);
router.post("/login-attempt", loginController.loginAttempt);
router.get("/logout", loginController.logout);

module.exports = router;