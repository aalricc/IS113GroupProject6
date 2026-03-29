const { getMovieById, getMovieTrailer } = require("../data/movies");
const { Review } = require("../models/moviereviews-model");
const MovieTrailer = require("../models/movie-trailer-model");
const MovieStats = require('../models/moviestats-model');

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

exports.moviereviews = async (req,res) => {
    try {
    const id = req.params.id
    const editId = req.query.editId || null; // checks if we are allowing the user to edit
    const movieData = await getMovieById(id) // This gets data from the id that is in the query
    const movieReviews = await Review.find({ movieId: id })
    const savedTrailer = await MovieTrailer.findOne({ movieId: id }).lean();
    const hasSavedTrailer = !!savedTrailer;
    const movieTrailer = hasSavedTrailer
        ? formatTrailer(savedTrailer)
        : formatTrailer(await getMovieTrailer(movieData.title, id));
    let averageRating = null; 
        if (movieReviews.length > 0) {
            // .reduce() adds up all the ratings in the array
            const totalRating = movieReviews.reduce((sum, review) => sum + review.rating, 0); // Sums all the ratings together
            // Divide by total number of reviews and round to 1 decimal place
            averageRating = (totalRating / movieReviews.length).toFixed(1); 
        }
    const stats = await MovieStats.findOneAndUpdate(
            { movieId: id },          // Find the movie by its ID
            { $inc: { viewCount: 1 } },    // Increment viewCount by 1
            { returnDocument: 'after', upsert: true }   // 'new' returns the updated doc, 'upsert' creates it if it doesn't exist
        );
    res.render("moviereviews",{
        movieData,
        movieReviews,
        editId,
        isLoggedIn: req.session.isLoggedIn || false, // Pass the session data into the view
        currentUser: req.session.currentUser || null,
        isAdmin: req.session.isAdmin || false,
        viewCount: stats.viewCount,
        averageRating,
        movieTrailer,
        hasSavedTrailer
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
        const newReview = new Review({
            movieId: id,
            reviewContent: description,
            rating: rating,
            username: req.session.currentUser.username, // Temporary until you have login sessions
            userId: req.session.currentUser.id
        });

        // 2. Save the new review to MongoDB under our review schema
        await newReview.save(); 

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
        const review = await Review.findById(reviewId)
 // 1. Find the review
        if (!review) {
            return res.status(404).send("Review not found")
        }

// 2. Check if the current session id and review id is the same
        if (String(review.userId) !== String(req.session.currentUser.id)) {
            return res.status(403).send("Unauthorised")
        }
        // 3. // checks in the backend for security
const isOwner = String(review.userId) === String(req.session.currentUser.id);
   const isAdmin = req.session.isAdmin === true;

        if (!isOwner && !isAdmin) {
            return res.status(403).send("Unauthorised")
        }
        // 4. Tell MongoDB to find the document with this ID and remove it
        await Review.findByIdAndDelete(reviewId);

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
       const review = await Review.findById(reviewId);
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
        await Review.findByIdAndUpdate(
            reviewId, 
            { rating, reviewContent: description }
        );

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
