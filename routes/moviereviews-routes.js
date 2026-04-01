
const express = require("express");

const moviereviewsController = require("./../controllers/moviereviews-controller");

const router = express.Router();

const { checkIfLogged, checkIfAdmin } = require("../middleware/auth-middleware.js");

router.post("/movie-trailer/:movieId", checkIfLogged, checkIfAdmin, moviereviewsController.createTrailer);

router.post("/update-trailer/:movieId", checkIfLogged, checkIfAdmin, moviereviewsController.updateTrailer);

router.post("/delete-trailer/:movieId", checkIfLogged, checkIfAdmin, moviereviewsController.deleteTrailer);

router.get('/movie-reviews/:id', moviereviewsController.moviereviews);

router.post("/movie-reviews/:id", checkIfLogged,moviereviewsController.postReview);

router.post("/delete-review/:reviewId/:movieId", checkIfLogged,moviereviewsController.deleteReview)

router.post("/update-review/:reviewId/:movieId", checkIfLogged,moviereviewsController.updateReview)

module.exports = router;
