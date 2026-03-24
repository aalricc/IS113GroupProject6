const express = require('express');

const searchController = require('./../controllers/search-controller');

const router = express.Router(); // sub application

// Define a GET route to display the list of books
router.get("/search", searchController.searchMovie);

router.post("/history-clear", searchController.clearHistory);
// EXPORT
module.exports = router;