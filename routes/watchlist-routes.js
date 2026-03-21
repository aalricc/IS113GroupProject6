const express = require("express");

const watchlistController = require("./../controllers/watchlist-controller");

router = express.Router();

router.get("/watchlist", watchlistController.someFunction);

router.post("/removeMovie", watchlistController.someFunction);
router.post("/markWatched", watchlistController.someFunction);
module.exports = router;