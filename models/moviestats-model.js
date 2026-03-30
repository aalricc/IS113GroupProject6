const mongoose = require('mongoose');

const movieStatsSchema = new mongoose.Schema({
    // Store the ID of the movie (can be a String or Number depending on your setup)
    movieId: { 
        type: String, 
        required: true, 
        unique: true 
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
module.exports = {
    MovieStats,
    UserView
};