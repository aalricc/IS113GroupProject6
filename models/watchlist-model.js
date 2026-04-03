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

watchlistSchema.index({ username: 1, movieId: 1 }, { unique: true });

const Watchlist = mongoose.models.Watchlist || mongoose.model("Watchlist", watchlistSchema);

//Methods here

exports.findWatchlistByUsername = function(username) {
    return Watchlist.find({username: username})
}


exports.findWatchlistbyUsernameAndMovieName = function(username, movieName) {
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

exports.updateMovieRating = function(movieID, averageRating) {
    return Watchlist.updateMany({movieId: movieID}, {rating: averageRating}) 
}

exports.markAsUnwatched = function(username, movieName) {
    return Watchlist.updateOne({username: username, movieName: movieName}, {hasWatched: false}) 
}

exports.createWatchlist = function(newMovie) {
    return Watchlist.create(newMovie)
}

exports.Watchlist = Watchlist;