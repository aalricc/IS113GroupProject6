const { getMovieById, getMovieTrailer } = require("../data/movies");
const Review = require("../models/moviereviews-model");
const MovieTrailer = require("../models/movie-trailer-model");
const StatsModel = require('../models/moviestats-model');
const Watchlist = require('./../models/watchlist-model');

function formatTrailer(trailer) {
    if (!trailer || !trailer.youtubeKey) {
        return null;
    }

    return {
        trailerName: trailer.trailerName,
        youtubeKey: trailer.youtubeKey,
        url: `https://www.youtube.com/watch?v=${trailer.youtubeKey}`,
        embedUrl: `https://www.youtube.com/embed/${trailer.youtubeKey}`
    };
}

async function updateMovieAverage(movieId) {
    const reviews = await Review.findReviewsByMovieId(movieId);
    let averageRating = null;
    let totalReviews = reviews.length;

    if (totalReviews > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        // .toFixed(1) turns it into a string, so we wrap it in Number() to save it properly to MongoDB
        averageRating = Number((totalRating / totalReviews).toFixed(1));
    }

    // Save the new math to the MovieStats document
    await StatsModel.updateMovieRatingStats(movieId, averageRating, totalReviews);
    await Watchlist.updateMovieRating(movieId, averageRating)


}

exports.moviereviews = async (req,res) => {
    try {
    const id = req.params.id
    const editId = req.query.editId || null; // checks if we are allowing the user to edit
    const movieData = await getMovieById(id) // This gets data from the id that is in the query
    const movieReviews = await Review.findReviewsByMovieId(id);
    const savedTrailer = await MovieTrailer.findOne({ movieId: id }).lean();
    const hasSavedTrailer = !!savedTrailer;
    const movieTrailer = hasSavedTrailer
        ? formatTrailer(savedTrailer)
        : formatTrailer(await getMovieTrailer(movieData.title, id));
    const stats = await StatsModel.incrementGlobalViews(id);
        // Update Specific User Views (Only if logged in)
        if (req.session.isLoggedIn && req.session.currentUser) {
            await StatsModel.incrementUserViews(req.session.currentUser.id, id);
        }
    res.render("moviereviews",{
        movieData,
        movieReviews,
        editId,
        isLoggedIn: req.session.isLoggedIn || false, // Pass the session data into the view
        currentUser: req.session.currentUser || null,
        isAdmin: req.session.isAdmin || false,
        viewCount: stats.viewCount,
        movieTrailer,
        hasSavedTrailer,
        averageRating: stats.averageRating || null
    })
} catch(error) {
    console.error("Error loading movie reviews:", error);
        res.status(500).send(`Server Error: ${error}`);
}
}

exports.postReview = async (req, res) => {
    try {
        if (!req.session.isLoggedIn || !req.session.currentUser) {
            return res.redirect("/login")
        }
        const id = req.params.id; // Get ID from URL
        const { rating, description } = req.body; // Get data from EJS form

        // 1. Create a new review in the Review schema
        await Review.createReview({
            movieId: id,
            reviewContent: description,
            rating: rating,
            username: req.session.currentUser.username, 
            userId: req.session.currentUser.id
        });

        // 2. Save the new review to MongoDB under our review schema
        await updateMovieAverage(id); // Update the movie average rating

        // 3. CRITICAL: Redirect back to the movie page
        // This triggers the GET request again, which now finds the new review
        res.redirect(`/movie-reviews/${id}`);

    } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).send("Could not save review.");
    }
};

exports.deleteReview = async (req,res) => {
    try {
        const { reviewId, movieId } = req.params;
        const review = await Review.findReviewById(reviewId);
 // 1. Find the review
        if (!review) {
            return res.status(404).send("Review not found")
        }

        // 3. // checks in the backend for security
        const isOwner = String(review.userId) === String(req.session.currentUser.id);
        const isAdmin = req.session.isAdmin === true;

        if (!isOwner && !isAdmin) {
            return res.status(403).send("Unauthorised")
        }
        // 4. Tell MongoDB to find the document with this ID and remove it
        await Review.deleteReviewById(reviewId);
        await updateMovieAverage(movieId);

        // 5. Redirect back to the movie page so the user sees the updated list
        res.redirect(`/movie-reviews/${movieId}`);
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send("Could not delete the review.");
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { reviewId, movieId } = req.params;
        const { rating, description } = req.body;

        // 1. Find the review
       const review = await Review.findReviewById(reviewId);
        if (!review) {
            return res.status(404).send("Review not found");
        }

        // 2. Verify permissions (Owner OR Admin)
        const isOwner = String(review.userId) === String(req.session.currentUser.id);
        const isAdmin = req.session.isAdmin === true;

        if (!isOwner && !isAdmin) {
            return res.status(403).send("Unauthorised");
        }

        // 3. Update the review since authorization passed
        await Review.updateReviewById(reviewId, { rating, reviewContent: description });
        await updateMovieAverage(movieId); // update the average rating as well

        res.redirect(`/movie-reviews/${movieId}`);
    } catch (error) {
        res.status(500).send("Update failed");
    }
};

exports.createTrailer = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { movieName } = req.body;
        const existingTrailer = await MovieTrailer.findOne({ movieId });

        if (existingTrailer) {
            return res.redirect(`/movie-reviews/${movieId}`);
        }

        const trailer = await getMovieTrailer(movieName, movieId);

        if (!trailer) {
            return res.redirect(`/movie-reviews/${movieId}`);
        }

        await MovieTrailer.create({
            movieId,
            movieName,
            trailerName: trailer.trailerName,
            youtubeKey: trailer.youtubeKey
        });

        res.redirect(`/movie-reviews/${movieId}`);
    } catch (error) {
        console.error("Error saving trailer:", error);
        res.status(500).send("Could not save trailer.");
    }
};

exports.updateTrailer = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { movieName } = req.body;
        const existingTrailer = await MovieTrailer.findOne({ movieId });

        if (!existingTrailer) {
            return res.redirect(`/movie-reviews/${movieId}`);
        }

        const trailer = await getMovieTrailer(movieName, movieId);

        if (!trailer) {
            return res.redirect(`/movie-reviews/${movieId}`);
        }

        await MovieTrailer.findOneAndUpdate(
            { movieId },
            {
                movieName,
                trailerName: trailer.trailerName,
                youtubeKey: trailer.youtubeKey
            }
        );

        res.redirect(`/movie-reviews/${movieId}`);
    } catch (error) {
        console.error("Error updating trailer:", error);
        res.status(500).send("Could not update trailer.");
    }
};

exports.deleteTrailer = async (req, res) => {
    try {
        const { movieId } = req.params;

        await MovieTrailer.findOneAndDelete({ movieId });

        res.redirect(`/movie-reviews/${movieId}`);
    } catch (error) {
        console.error("Error deleting trailer:", error);
        res.status(500).send("Could not delete trailer.");
    }
};
