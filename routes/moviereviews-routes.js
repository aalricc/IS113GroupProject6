
const express = require("express");

const moviereviewsController = require("./../controllers/moviereviews-controller");

const router = express.Router();

const {checkIfLogged} = require("../middleware/auth-middleware.js")

router.get('/movie-reviews/:id', moviereviewsController.moviereviews);

router.post("/movie-reviews/:id", checkIfLogged,moviereviewsController.postReview);

router.post("/delete-review/:reviewId/:movieId", checkIfLogged,moviereviewsController.deleteReview)

module.exports = router;