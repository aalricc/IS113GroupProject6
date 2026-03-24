const express = require("express");
const authMiddleware = require('.././middleware/auth-middleware');

const watchlistController = require("./../controllers/watchlist-controller");

const router = express.Router();

router.get("/", authMiddleware, watchlistController.showWatchlist);

router.post("/removeMovie", authMiddleware, watchlistController.removeMovie);
router.post("/markWatched", authMiddleware, watchlistController.markWatched);
router.post("/markUnwatched", authMiddleware, watchlistController.markUnwatched);
router.post("/createMovie", authMiddleware, watchlistController.createWatchlist);
module.exports = router;