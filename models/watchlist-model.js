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
        default: Date.now
    },
    hasWatched: {
        type: Boolean,
        default: false
    },
    movieId: {
        type: Number
    }
    
});

const Watchlist = mongoose.models.Watchlist || mongoose.model("Watchlist", watchlistSchema);

//Methods here

exports.findWatchlistByID = function(userId) {
    return Watchlist.find({userId: userId})
}


exports.findWatchlistbyIDandName = function(userId, movieName) {
    return Watchlist.findOne( {
        userId: userId, 
        movieName: movieName
    } )
}


exports.removeMovie = function(userId, movieName) {
    return Watchlist.deleteOne({userId: userId, movieName: movieName})
}

exports.markAsWatched = function(userId, movieName) {
    return Watchlist.updateOne({userId: userId, movieName: movieName}, {hasWatched: true}) 
}

exports.markAsUnwatched = function(userId, movieName) {
    return Watchlist.updateOne({userId: userId, movieName: movieName}, {hasWatched: false}) 
}

exports.createWatchlist = function(newMovie) {
    return Watchlist.create(newMovie)
}
