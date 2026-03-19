
const express = require("express");

const moviereviewsController = require("./../controllers/moviereviews-controller");

router = express.Router();

router.get("/movie-reviews", moviereviewsController.moviereviews);

router.post("/movie-reviews", moviereviewsController.postReview);

module.exports = router;