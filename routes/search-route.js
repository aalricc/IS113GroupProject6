const express = require('express');

const searchController = require('./../controllers/search-controller');

const router = express.Router(); // sub application

router.get("/search", searchController.searchMovies);

router.post("/history-clear", searchController.clearHistory);
// EXPORT
module.exports = router;