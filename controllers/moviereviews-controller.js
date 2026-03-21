const  {getPopularMovies,searchMovies,getMovieById}  = require("../data/movies");
const {Review} = require("../data/mongo")

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
    const description = req.body.description;
    
    console.log(`Rating: ${rating}, Comment: ${description}`);
    // Here you would typically save to a database
    res.send("Review received!");
};