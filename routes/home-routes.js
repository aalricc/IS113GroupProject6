const express = require("express");

const homeController = require("./../controllers/home-controller");

router = express.Router();

router.get("/home", homeController.someFunction);

module.exports = router;