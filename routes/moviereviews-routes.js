
const express = require("express");

const moviereviewsController = require("./../controllers/moviereviews-controller");

router = express.Router();

router.get('/movie-reviews/:id', moviereviewsController.moviereviews);

router.post("/movie-reviews/:id", moviereviewsController.postReview);

module.exports = router;