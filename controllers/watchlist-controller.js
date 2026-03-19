const fs = require('fs/promises');

const Movie = require('./../models/book-model');

exports.showWatchlist = async (req, res) => {

 // Need to retrieve user id first
  try {
    let watchList = await Movie.findWatchlistByID(user_id); // Go through the DB and find watchlist according to user_id
    console.log(watchList);
    res.render("watchlist", { watchList }); // Render the EJS form view and pass the posts
  } catch (error) {
    console.error(error);
    res.send("Error reading database"); // Send error message if fetching fails
  }
};

exports.removeMovie = async (req, res) => {
    // Need to retrieve user id first
    // Search through MongoDB to find the movie title
    // Delete entry from MongoDB based on movie title
    const movie_name = req.body.movie
    try {
        let user_id = await Movie.findWatchlistByID(user_id) // Go through the DB and find watchlist according to user_id
        // For findWatchlistByID Implementation:
        // 1) Use built in function findOne({user_id : user_id})
        let success= await Movie.removeMovie(isbnNo, movie_name) // Remove movie from DB according to user_id and name of movie
        // For removeMovieByTitle Implementation:
        // 1) Use built in function deleteOne({user_id : user_id, movie_name: movie_name})

        if(success.deletedCount === 1) {
            console.log("Movie successfully removed from watchlist")
        }
    }

    catch (error) {
        console.error(error);
        res.send("Failed to remove movie");
    }

    res.redirect("/watchlist")
}

exports.markWatched = async (req,  res) => {
    // Need to retrieve user id first
    const movie_name = req.body.movie
    try {
        let user_id = await Movie.findWatchlistByID(user_id) // Go through the DB and find watchlist according to user_id
        // For findWatchlistByID Implementation:
        // 1) Use built in function findOne({user_id : user_id})
        let movie = await Movie.markAsWatched(user_id, movie_name) // Mark movie as watched according to user_id and name of movie
        // For removeMovieByTitle Implementation:
        // 1) Use built in function deleteOne({user_id : user_id, movie_name: movie_name})
    }

    catch(error) {
        console.log(error);
        res.send("Error reading database")
    }

    res.redirect("/watchlist")
}