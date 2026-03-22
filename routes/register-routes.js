
const express = require("express");

const registerController = require("./../controllers/register-controller");

const router = express.Router();

router.get("/register", registerController.showRegisterPage);
router.post("/register-attempt", registerController.registerAttempt);

module.exports = router;