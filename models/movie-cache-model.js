const mongoose = require("mongoose");

const movieCacheSchema = new mongoose.Schema({
    cacheKey: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    movies: {
        type: Array,
        default: []
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const MovieCache = mongoose.models.MovieCache || mongoose.model("MovieCache", movieCacheSchema);

module.exports = {
    MovieCache
};
