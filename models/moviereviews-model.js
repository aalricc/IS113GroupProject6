const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        movieId: {
            type: String,
            required: true,
            index: true
        },
        reviewContent: {
            type: String,
            required: true,
            trim: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },
        userId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

module.exports = {
    Review
};
