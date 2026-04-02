const mongoose = require('mongoose');

const movieStatsSchema = new mongoose.Schema({
    // Store the ID of the movie (can be a String or Number depending on your setup)
    movieId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    movieTitle: {
        type: String,
        default: ""
    },
    // The actual view counter
    viewCount: { 
        type: Number, 
        default: 0 
    },
    averageRating: {
        type: Number,
        default: null // null means no reviews yet
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const userViewSchema = new mongoose.Schema(
    {
        userId: {
            type: String, // Storing as a string to match your Review schema style
            required: true,
            index: true
        },
        movieId: {
            type: String,
            required: true,
            index: true
        },
        viewCount: {
            type: Number,
            default: 1, // Starts at 1 when the document is first created
            min: 1
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt dates
    }
);

userViewSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // This ensures that the combination of the userId and the movieId is unique 

// 1. Create the models and assign them to variables
const MovieStats = mongoose.model('MovieStats', movieStatsSchema);
const UserView = mongoose.model('UserView', userViewSchema);

// 2. Export them together as an object
// --- Controller Methods ---

// 1. Updates the average rating and total reviews
exports.updateMovieRatingStats = function(movieId, averageRating, totalReviews) {
    return MovieStats.findOneAndUpdate(
        { movieId: movieId },
        {
            averageRating: averageRating,
            totalReviews: totalReviews,
            lastUpdated: new Date()
        },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
};

// 2. Increments the global view count for a movie
exports.incrementGlobalViews = function(movieId, movieTitle = "") {
    const update = {
        $inc: { viewCount: 1 },
        $set: { lastUpdated: new Date() }
    };

    if (movieTitle) {
        update.$set.movieTitle = movieTitle;
    }

    return MovieStats.findOneAndUpdate(
        { movieId: movieId },
        update,
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
};

// 3. Increments the view count for a specific user on a specific movie
exports.incrementUserViews = function(userId, movieId) {
    return UserView.findOneAndUpdate(
        { userId: userId, movieId: movieId },
        { $inc: { viewCount: 1 } },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
};

exports.MovieStats = MovieStats;
exports.UserView = UserView;
