const  {getPopularMovies,searchMovies,getMovieById}  = require("../data/movies");
const {Review,pushToDB} = require("../models/moviereviews-model")

exports.moviereviews = async (req,res) => {
    const id = req.params.id
    const movieData = await getMovieById(id) // This gets data from the id that is in the query
    const movieReviews = await Review.find({ movieId: id }) 
    res.render("moviereviews",{
        movieData,
        movieReviews
    })
}

exports.postReview = async (req, res) => {
    const id = req.params.id
    const rating = req.body.rating;
    
    
    console.log(`Rating: ${rating}, Comment: ${description}`);
    // Here you would typically save to a database
    res.send("Review received!");
};


// controllers/moviereviews-controller.js

exports.postReview = async (req, res) => {
    try {
        const id = req.params.id; // Get ID from URL
        const { rating, description } = req.body; // Get data from EJS form

        // 1. Create a new document using your Schema
        const newReview = new Review({
            movieId: id,
            reviewContent: description,
            rating: rating,
            username: "Guest User", // Temporary until you have login sessions
            userId: "12345" 
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

        // 1. Tell MongoDB to find the document with this ID and remove it
        await Review.findByIdAndDelete(reviewId);

        // 2. Redirect back to the movie page so the user sees the updated list
        res.redirect(`/movie-reviews/${movieId}`);
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send("Could not delete the review.");
    }
};