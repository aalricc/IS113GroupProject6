const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    movieName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now,
        required: true
    },
    hasWatched: {
        type: Boolean,
        default: false,
        required: true
    },
    movieId: {
        type: Number,
        required: true
    }
    
});

const Watchlist = mongoose.models.Watchlist || mongoose.model("Watchlist", watchlistSchema);

//Methods here

exports.findWatchlistByID = function(username) {
    return Watchlist.find({username: username})
}


exports.findWatchlistbyIDandName = function(username, movieName) {
    return Watchlist.findOne( {
        username: username, 
        movieName: movieName
    } )
}


exports.removeMovie = function(username, movieName) {
    return Watchlist.deleteOne({username: username, movieName: movieName})
}

exports.markAsWatched = function(username, movieName) {
    return Watchlist.updateOne({username: username, movieName: movieName}, {hasWatched: true}) 
}

exports.markAsUnwatched = function(username, movieName) {
    return Watchlist.updateOne({username: username, movieName: movieName}, {hasWatched: false}) 
}

exports.createWatchlist = function(newMovie) {
    return Watchlist.create(newMovie)
}
