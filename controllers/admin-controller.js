const mongoose = require("mongoose");
require("../models/moviereviews-model");
const User = require("../models/user");
require("../models/watchlist-model");
const { SearchHistory } = require("../models/searchHistory-model");
const { MovieStats } = require("../models/moviestats-model");
const { getLinearRegressionPrediction } = require("../data/recommendations");
const { getMovieById } = require("../data/movies");

function getMovieRow(movieMap, movieId) {
    const key = String(movieId);

    if (!movieMap[key]) {
        movieMap[key] = {
            movieId: key,
            movieTitle: "",
            viewCount: 0,
            watchlistCount: 0,
            searchCount: 0,
            totalCount: 0,
            popularityScore: 0
        };
    }

    return movieMap[key];
}

async function fetchMissingTitles(movies) {
    for (let row of movies) {
        if (!row.movieTitle) {
            try {
                const movie = await getMovieById(row.movieId);
                if (movie && movie.title) {
                    row.movieTitle = movie.title;
                }
            } catch (err) {
                console.error("Error fetching movie title for ID:", row.movieId, err);
            }
        }
    }
}

async function getTopMovieActivity() {
    const movieMap = {};
    const viewStats = await MovieStats.find();
    const watchlistEntries = await mongoose.models.Watchlist.find();
    const searchEntries = await SearchHistory.find();

    for (let stat of viewStats) {
        const row = getMovieRow(movieMap, stat.movieId);
        row.viewCount = stat.viewCount || 0;
    }

    for (let entry of watchlistEntries) {
        const row = getMovieRow(movieMap, entry.movieId);
        row.watchlistCount += 1;

        if (!row.movieTitle && entry.movieName) {
            row.movieTitle = entry.movieName;
        }
    }

    for (let entry of searchEntries) {
        const countedMovies = {};
        const searchCount = entry.searchCount || 1;

        if (!Array.isArray(entry.results)) {
            continue;
        }

        for (let movie of entry.results) {
            if (!movie || typeof movie.id === "undefined") {
                continue;
            }

            const movieId = String(movie.id);

            if (countedMovies[movieId]) {
                continue;
            }

            countedMovies[movieId] = true;

            const row = getMovieRow(movieMap, movieId);
            row.searchCount += searchCount;

            if (!row.movieTitle && movie.title) {
                row.movieTitle = movie.title;
            }
        }
    }

    const topMovies = [];

    for (let movieId in movieMap) {
        const row = movieMap[movieId];

        row.totalCount = row.searchCount + row.watchlistCount + row.viewCount;

        row.popularityScore = getLinearRegressionPrediction(
            row.searchCount,
            row.watchlistCount,
            row.viewCount
        );

        topMovies.push(row);
    }

    topMovies.sort((movieA, movieB) => {
        if (movieB.popularityScore !== movieA.popularityScore) {
            return movieB.popularityScore - movieA.popularityScore;
        }

        if (movieB.totalCount !== movieA.totalCount) {
            return movieB.totalCount - movieA.totalCount;
        }

        if (movieB.viewCount !== movieA.viewCount) {
            return movieB.viewCount - movieA.viewCount;
        }

        if (movieB.watchlistCount !== movieA.watchlistCount) {
            return movieB.watchlistCount - movieA.watchlistCount;
        }

        return movieB.searchCount - movieA.searchCount;
    });

    const top10 = topMovies.slice(0, 10);

    await fetchMissingTitles(top10);

    for (let row of top10) {
        if (!row.movieTitle) {
            row.movieTitle = "Movie ID " + row.movieId;
        }
    }

    return top10;
}

exports.showAdminPage = async (req, res) => {
    try {
        const reviews = await mongoose.models.Review.find();
        const users = await User.retrieveAll();
        const topMovieActivity = await getTopMovieActivity();

        const created = req.query.created || null;
        const updated = req.query.updated || null;

        res.render("admin", { reviews, users, topMovieActivity, created, updated });
    } catch (error) {
        console.error("Error occured fetching admin data", error);
        res.status(500).send("Error loading admin page");
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        await User.createUser({
            username,
            email,
            password
        });

        res.redirect("/admin-page?created=true");
    } catch (error) {
        console.error("Error creating user", error);
        res.status(500).send("Could not create user");
    }
};

exports.deleteReviewAsAdmin = async (req, res) => {
    try {
        await mongoose.models.Review.findByIdAndDelete(req.params.reviewId);
        res.redirect("/admin-page");
    } catch (error) {
        console.error("Error deleting review", error);
        res.status(500).send("Could not delete review");
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        await User.findByIdAndDelete(id);
        res.redirect("/admin-page");
    } catch (error) {
        console.error("Error deleting user", error);
        res.status(500).send("Could not delete user");
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { username, email } = req.body;

        await User.findByIdAndUpdate(
            id,
            { username, email },
            { runValidators: true }
        );
        res.redirect("/admin-page?updated=true");
    } catch (error) {
        console.error("Error updating user", error);
        res.status(500).send("Could not update user");
    }
};