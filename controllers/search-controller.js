// search-controller.js
const { searchMovies: fetchMovies } = require("../data/movies");
const { SearchHistory } = require("../models/searchHistory-model"); 

exports.searchMovies = async (req, res) => { 
  const query = req.query.query || "";
  const clean = query.trim().toLowerCase();

  const isLoggedIn = !!req.session.isLoggedIn;
  const userId = req.session.currentUser?.id;

  // if nothing is searched
  if (clean === "") {
    let history = [];
    if (isLoggedIn && userId) {
    // if logged in but search nothing, render history
      history = await SearchHistory.findByIDandSort(userId); 
    }
    return res.render("search", { query, results: [], history, isLoggedIn, err:""});
  }

  try {
    const results = await fetchMovies(clean); 
    let history = [];
    
    // check if logged in
    if (isLoggedIn && userId) {
      // find the existitng history of the user
      const existing = await SearchHistory.findExistingHistoryQuery(userId, clean); 

      // if history exists
      if (existing) {
        // ._id to find the specific doc
        // updates the count 
        await SearchHistory.upHistory(existing._id, existing.searchCount); 
      
      // if the query doesnt exist in mongodb add it
      } else { 
      
      // creates or adds history basically
        await SearchHistory.addHistory({ 
          userId,
          query: clean,
          results,
          resultCount: results.length,
          searchCount: 1,
          searchedAt: new Date()
        });
      }

      // gives the final history of everything
      history = await SearchHistory.findByIDandSort(userId); 
    }
    // renders the history
    res.render("search", { query: clean, results, history, isLoggedIn, err:""});

  } catch (err) {
    console.error("[Search] Error:", err);
    res.render("search", { query: clean, results: [], history: [], isLoggedIn, err});
  }
};

// clear history
exports.clearHistory = async (req, res) => {
  const userId = req.session.currentUser?.id;
  if (userId) {
    await SearchHistory.clearHist(userId);
  }
  res.redirect("/search");
};