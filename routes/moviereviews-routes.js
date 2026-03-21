
const express = require("express");

const moviereviewsController = require("./../controllers/moviereviews-controller");

router = express.Router();

router.get('/movie/:id', moviereviewsController.moviereviews);

router.post("/movie-reviews", moviereviewsController.postReview);

module.exports = router;