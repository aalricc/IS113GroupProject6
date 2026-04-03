const express = require("express");

const watchlistController = require("./../controllers/watchlist-controller");
const { checkIfLogged } = require("./../middleware/auth-middleware");

const router = express.Router();

router.get("/watchlist", watchlistController.showWatchlist);

router.post("/removeMovie", checkIfLogged, watchlistController.removeMovie);
router.post("/markWatched", checkIfLogged, watchlistController.markWatched);
router.post("/markUnwatched", checkIfLogged, watchlistController.markUnwatched);
router.post("/createMovie", checkIfLogged, watchlistController.createWatchlist);

module.exports = router;
