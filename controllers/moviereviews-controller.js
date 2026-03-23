
const  {getPopularMovies,searchMovies,getMovieById}  = require("../data/movies");
const {Review,pushToDB} = require("../models/moviereviews-model")
const {User} = require("../models/user")

exports.moviereviews = async (req,res) => {
    try {
    const id = req.params.id
    const movieData = await getMovieById(id) // This gets data from the id that is in the query
    const movieReviews = await Review.find({ movieId: id }) 
    res.render("moviereviews",{
        movieData,
        movieReviews,
        isLoggedIn: req.session.isLoggedIn || false, // Pass the session data into the view
        currentUser: req.session.currentUser || null
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

        // 1. Create a new document using your Schema
        const newReview = new Review({
            movieId: id,
            reviewContent: description,
            rating: rating,
            username: req.session.currentUser.username, // Temporary until you have login sessions
            userId: req.session.currentUser.id
        });

        // 2. Save it to MongoDB
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

        // 3. Tell MongoDB to find the document with this ID and remove it
        await Review.findByIdAndDelete(reviewId);

        // 4. Redirect back to the movie page so the user sees the updated list
        res.redirect(`/movie-reviews/${movieId}`);
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send("Could not delete the review.");
    }
};
