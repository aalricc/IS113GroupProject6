const express = require("express");
const router = express.Router();
const {
  renderHomePage,
  clearMovieCache,
} = require("../controllers/home-controller");

router.get("/", renderHomePage);
router.post("/clear-movie-cache", clearMovieCache);

module.exports = router;
