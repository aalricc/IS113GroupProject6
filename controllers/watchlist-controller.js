

const Watchlist = require('./../models/watchlist-model');

exports.showWatchlist = async (req, res) => {

    try {
        if (!req.session.currentUser || !req.session.currentUser.username) {
             return res.render("watchlist", { isLoggedIn: false, watchList: "", msg: "" })
        }
        else {
            let watchList = await Watchlist.findWatchlistByUsername(req.session.currentUser.username); 
            res.render("watchlist", { isLoggedIn: true, watchList, msg: "" }); 
        }
    } catch (error) {
        console.error(error);
        res.send("Error reading database."); 
    }
};

exports.removeMovie = async (req, res) => {

    const movie_name = req.body.movie
   
    try {
        let success = await Watchlist.removeMovie(req.session.currentUser.username, movie_name) 

        if (success.deletedCount === 1) {
            console.log("Movie successfully removed from watchlist")
        }
    }

    catch (error) {
        console.error(error);
        return res.send("Failed to remove movie");
    }
    res.redirect("/watchlist")
}

exports.markWatched = async (req, res) => {

    const movie_name = req.body.movie

    try {
        let updatedMovie = await Watchlist.markAsWatched(req.session.currentUser.username, movie_name) 
        console.log(updatedMovie)
    }

    catch (error) {
        console.log(error);
        res.send("Failed to update movie")
    }

    res.redirect("/watchlist")
}

exports.markUnwatched = async (req, res) => {

    const movie_name = req.body.movie

    try {
        let updatedMovie = await Watchlist.markAsUnwatched(req.session.currentUser.username, movie_name) 
        console.log(updatedMovie)
    }

    catch (error) {
        console.log(error);
        res.send("Failed to update movie")
    }

    res.redirect("/watchlist")
}

exports.createWatchlist = async (req, res) => {
    try {

        if (!req.session.currentUser || !req.session.currentUser.username) {
            res.render("watchlist", { isLoggedIn: false, watchList: "", msg: "" })
        }

        else {
            const name = req.body.movie;
            const rating = req.body.rating;
            const id = req.body.id

            let newMovie = {
                movieName: name,
                rating: rating,
                hasWatched: false,
                username: req.session.currentUser.username,
                movieId: id
            }

            let movie = await Watchlist.findWatchlistbyUsernameAndMovieName(req.session.currentUser.username, name)

            if (movie) {
                let msg = "Movie already exists in the watchlist"
                let watchList = await Watchlist.findWatchlistByUsername(req.session.currentUser.username)
                res.render("watchlist", {  isLoggedIn: true, msg, watchList })

            }

            else {
                let result = await Watchlist.createWatchlist(newMovie);
                console.log("Successfully added movie to watchlist")
                let msg = "Movie added to watchlist."
                let watchList = await Watchlist.findWatchlistByUsername(req.session.currentUser.username)

                res.render("watchlist", { isLoggedIn: true, msg, watchList })

            }

        }

    }

    catch (error) {
        console.log("Error adding movie to watchlist", error);
        res.send("Error adding movie to watchlist");
    }


}
