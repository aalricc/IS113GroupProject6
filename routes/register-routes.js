
const express = require("express");

const registerController = require("./../controllers/register-controller");

router = express.Router();

router.get("/register", registerController.someFunction);

router.post("/register-attempt", registerController.someFunction);

module.exports = router;