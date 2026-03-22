const express = require("express");

const watchlistController = require("./../controllers/watchlist-controller");

router = express.Router();

router.get("/", watchlistController.showWatchlist);

router.post("/removeMovie", watchlistController.removeMovie);
router.post("/markWatched", watchlistController.markWatched);
router.post("/markUnwatched", watchlistController.markUnwatched);
router.post("/createMovie", watchlistController.createWatchlist);
module.exports = router;