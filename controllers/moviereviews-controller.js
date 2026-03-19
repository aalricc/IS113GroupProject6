exports.moviereviews = (req,res) => {
    res.render("moviereviews",{
    })
}

exports.postReview = (req, res) => {
    const rating = req.body.rating;
    const description = req.body.description;
    
    console.log(`Rating: ${rating}, Comment: ${description}`);
    // Here you would typically save to a database
    res.send("Review received!");
};