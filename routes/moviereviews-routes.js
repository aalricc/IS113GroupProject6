
const express = require("express");

const moviereviewsController = require("./../controllers/moviereviews-controller");

const router = express.Router();

router.get("/movie-reviews", moviereviewsController.someFunction);

router.post("/movie-reivew")

module.exports = router;