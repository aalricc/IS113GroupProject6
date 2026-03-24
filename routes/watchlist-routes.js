const express = require("express");
const authMiddleware = require('.././middleware/auth-middleware');

const watchlistController = require("./../controllers/watchlist-controller");

const router = express.Router();

router.get("/", authMiddleware.checkIfLogged, watchlistController.showWatchlist);

router.post("/removeMovie", authMiddleware.checkIfLogged, watchlistController.removeMovie);
router.post("/markWatched", authMiddleware.checkIfLogged, watchlistController.markWatched);
router.post("/markUnwatched", authMiddleware.checkIfLogged, watchlistController.markUnwatched);
router.post("/createMovie", authMiddleware.checkIfLogged, watchlistController.createWatchlist);

module.exports = router;