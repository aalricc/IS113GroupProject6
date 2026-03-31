const mongoose = require("mongoose");

const movieTrailerSchema = new mongoose.Schema(
    {
        movieId: {
            type: String,
            required: true,
            unique: true
        },
        movieName: {
            type: String,
            required: true,
            trim: true
        },
        trailerName: {
            type: String,
            required: true,
            trim: true
        },
        youtubeKey: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.MovieTrailer || mongoose.model("MovieTrailer", movieTrailerSchema);
