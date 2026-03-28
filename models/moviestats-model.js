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
    }
});

module.exports = mongoose.model('MovieStats', movieStatsSchema);