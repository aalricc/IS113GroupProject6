
const express = require("express");

const moviereviewsController = require("./../controllers/moviereviews-controller");

const router = express.Router();

router.get('/movie-reviews/:id', moviereviewsController.moviereviews);

router.post("/movie-reviews/:id", moviereviewsController.postReview);

router.post("/delete-review/:reviewId/:movieId", moviereviewsController.deleteReview)

module.exports = router;