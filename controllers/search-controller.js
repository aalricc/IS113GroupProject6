const { searchMovies: fetchMovies } = require("../data/movies");  // got naming error so renamed searchMovies --> fetchmovie
const { SearchHistory } = require("../models/searchHistory-model");

exports.searchMovies = async (req, res) => {
  const query = req.query.query || "";
  const clean = query.trim().toLowerCase();

  const isLoggedIn = !!req.session.isLoggedIn; // converts to boolean value
  const userId = req.session.currentUser?.id; // returns undefined of no user

  if (clean === "") {
    let history = [];
    if (isLoggedIn && userId) {
      history = await SearchHistory.find({ userId }).sort({ searchedAt: -1 });
    }
    return res.render("search", { query, results: [], history, isLoggedIn });
  }

  try {
    const results = await fetchMovies(clean); 
    let history = [];

    if (isLoggedIn && userId) {
      await SearchHistory.create({
        userId,
        query: clean,
        results,
        resultCount: results.length,
        searchedAt: new Date()
      });

      history = await SearchHistory.find({ userId }).sort({ searchedAt: -1 })
    }

    res.render("search", { query: clean, results, history, isLoggedIn });

  } catch (err) {
    console.error("[Search] Error:", err);
    res.render("search", { query: clean, results: [], history: [], isLoggedIn });
  }
};

exports.clearHistory = async (req, res) => {
  const userId = req.session.currentUser?.id;
  if (userId) {
    await SearchHistory.deleteMany({ userId });
  }
  res.redirect("/");
};