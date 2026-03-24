let searchHistory = [];
const {getPopularMovies,searchMovies} = require("../data/movies");
const movies = require("../models/moviereviews-model")


exports.searchMovie = async (req,res) => {
    let query = req.query.query || ""; // to label as query or undefined
    let clean = query.trim().toLowerCase();

  if (clean == "") {
    res.render("search", {query, results:[], history: searchHistory
    })
  }
  try {
    let results = await searchMovies(clean);
    searchHistory.unshift({
      query:clean,
      results,
      resultCount: results.length
    })
    res.render("search", {query:clean, results, history: searchHistory})
  } catch (err) {
    console.error('[Search] Error:', err);
    res.render('search', {query: clean, results: [], history: searchHistory, errorMsg: 'Search failed. Please try again.' });
  }
  };


exports.clearHistory =  (req, res) => {
  searchHistory = [];
  res.redirect("/");
};