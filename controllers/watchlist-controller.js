const fs = require('fs/promises');

const Movie = require('./../models/watchlist-model');

exports.showWatchlist = async (req, res) => {

    let user_id = "u123"

 // Need to retrieve user id first
  try {
    let watchList = await Movie.findWatchlistByID(user_id); // Go through the DB and find watchlist according to user_id
    // console.log(watchList);
    res.render("watchlist", { watchList, msg: "" }); // Render the EJS form view and pass the posts
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
    let user_id = "u123"
    try {
        let success= await Movie.removeMovie(user_id, movie_name) // Remove movie from DB according to user_id and name of movie
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
    let user_id = "u123"
    const movie_name = req.body.movie
    
    try {
        let updatedMovie = await Movie.markAsWatched(user_id,movie_name) // Mark movie as watched according to user_id and name of movie
        console.log(updatedMovie)
    }

    catch(error) {
        console.log(error);
        res.send("Failed to update movie")
    }

    res.redirect("/watchlist")
}

exports.markUnwatched = async (req,  res) => {
    // Need to retrieve user id first
    let user_id = "u123"
    const movie_name = req.body.movie
    
    try {
        let updatedMovie = await Movie.markAsUnwatched(user_id,movie_name) // Mark movie as watched according to user_id and name of movie
        console.log(updatedMovie)
    }

    catch(error) {
        console.log(error);
        res.send("Failed to update movie")
    }

    res.redirect("/watchlist")
}

exports.createWatchlist = async (req, res) => {
    let user_id = "u123";
    const name = req.body.movie;
    const rating = req.body.rating;
    const id = req.body.id

    let newMovie = {
        movieName: name,
        rating: rating,
        hasWatched: false,
        userId: user_id,
        movieId: id
    }

    try{

        let movie = await Movie.findWatchlistbyIDandName(user_id, name)
        console.log('Testing function')
        console.log(movie)

        if(movie) {
            let msg = "Movie already exists in the watchlist"
            let watchList = await Movie.findWatchlistByID(user_id)
            res.render("watchlist", {msg, watchList})

        }

        else {
            let result = await Movie.createWatchlist(newMovie);
            // console.log(result)
            console.log("Successfully added movie to watchlist")
            let msg = "Movie added to watchlist."
            let watchList = await Movie.findWatchlistByID(user_id)

            res.render("watchlist", {msg, watchList})

        }

    }

    catch(error) {
        console.log("Error adding movie to watchlist")
    }


}