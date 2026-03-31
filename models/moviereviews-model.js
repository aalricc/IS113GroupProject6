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
        timestamps: true // Records the time the review was created / updated: inbuilt functions of createdAt. and updatedAt.
    }
);

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

//methods
exports.findReviewsByMovieId = function(movieId) {
    return Review.find({ movieId: movieId });
};

exports.createReview = function(reviewData) {
    return Review.create(reviewData);
};

exports.findReviewById = function(reviewId) {
    return Review.findById(reviewId);
};

exports.deleteReviewById = function(reviewId) {
    return Review.findByIdAndDelete(reviewId);
};

exports.updateReviewById = function(reviewId, updateData) {
    return Review.findByIdAndUpdate(reviewId, updateData);
};
