const { getMovieById } = require("./movies");
const { UserView } = require("../models/moviestats-model");
const Watchlist = require("../models/watchlist-model");
const { SearchHistory } = require("../models/searchHistory-model");

function addGenreCount(genreCounts, genres, amount) {
    if (!Array.isArray(genres) || genres.length === 0) {
        return;
    }

    for (let genre of genres) {
        if (!genreCounts[genre]) {
            genreCounts[genre] = 0;
        }

        genreCounts[genre] += amount;
    }
}

function getLinearRegressionPrediction(searchCount, watchlistCount, viewCount) {
    const points = [
        { x: 1, y: searchCount },
        { x: 2, y: searchCount + watchlistCount },
        { x: 3, y: searchCount + watchlistCount + viewCount }
    ];

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let point of points) {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumXX += point.x * point.x;
    }

    const totalPoints = points.length;
    const numerator = (totalPoints * sumXY) - (sumX * sumY);
    const denominator = (totalPoints * sumXX) - (sumX * sumX);

    if (denominator === 0) {
        return 0;
    }

    const slope = numerator / denominator;
    const intercept = (sumY - (slope * sumX)) / totalPoints;
    const prediction = (slope * 4) + intercept;

    if (prediction < 0) {
        return 0;
    }

    return Number(prediction.toFixed(2));
}

async function getMovieGenres(movieId, movieGenreMap) {
    const key = String(movieId);

    if (movieGenreMap[key]) {
        return movieGenreMap[key];
    }

    try {
        const movie = await getMovieById(movieId);
        const genres = Array.isArray(movie.genres) ? movie.genres : [];
        movieGenreMap[key] = genres;
        return genres;
    } catch (error) {
        console.error("Error loading movie genres for recommendations:", error.message);
        movieGenreMap[key] = [];
        return [];
    }
}

async function getViewGenreCounts(userId, movieGenreMap, excludedMovieIds) {
    const genreCounts = {};
    const userViews = await UserView.find({ userId: String(userId) });

    for (let view of userViews) {
        const genres = await getMovieGenres(view.movieId, movieGenreMap);
        addGenreCount(genreCounts, genres, view.viewCount || 1);
        excludedMovieIds[String(view.movieId)] = true;
    }

    return genreCounts;
}

async function getWatchlistGenreCounts(username, movieGenreMap, excludedMovieIds) {
    const genreCounts = {};
    const watchlist = await Watchlist.findWatchlistByID(username);

    for (let movie of watchlist) {
        const genres = await getMovieGenres(movie.movieId, movieGenreMap);
        addGenreCount(genreCounts, genres, 1);
        excludedMovieIds[String(movie.movieId)] = true;
    }

    return genreCounts;
}

function getSearchGenreCounts(history) {
    const genreCounts = {};

    for (let entry of history) {
        const uniqueGenres = {};

        if (Array.isArray(entry.results)) {
            for (let movie of entry.results) {
                if (!Array.isArray(movie.genres)) {
                    continue;
                }

                for (let genre of movie.genres) {
                    uniqueGenres[genre] = true;
                }
            }
        }

        addGenreCount(genreCounts, Object.keys(uniqueGenres), entry.searchCount || 1);
    }

    return genreCounts;
}

function getGenreScores(searchGenreCounts, watchlistGenreCounts, viewGenreCounts) {
    const genreScores = {};
    const allGenres = {};

    for (let genre in searchGenreCounts) {
        allGenres[genre] = true;
    }

    for (let genre in watchlistGenreCounts) {
        allGenres[genre] = true;
    }

    for (let genre in viewGenreCounts) {
        allGenres[genre] = true;
    }

    for (let genre in allGenres) {
        const score = getLinearRegressionPrediction(
            searchGenreCounts[genre] || 0,
            watchlistGenreCounts[genre] || 0,
            viewGenreCounts[genre] || 0
        );

        if (score > 0) {
            genreScores[genre] = score;
        }
    }

    return genreScores;
}

function getMovieRecommendationScore(movie, genreScores) {
    if (!movie || !Array.isArray(movie.genres) || movie.genres.length === 0) {
        return 0;
    }

    let totalScore = 0;
    let matchedGenres = 0;

    for (let genre of movie.genres) {
        if (genreScores[genre]) {
            totalScore += genreScores[genre];
            matchedGenres += 1;
        }
    }

    if (matchedGenres === 0) {
        return 0;
    }

    return Number((totalScore / matchedGenres).toFixed(2));
}

async function getRecommendedMovies(currentUser, movies) {
    if (!currentUser || !currentUser.id || !currentUser.username) {
        return [];
    }

    const movieGenreMap = {};
    const excludedMovieIds = {};

    for (let movie of movies) {
        movieGenreMap[String(movie.id)] = Array.isArray(movie.genres) ? movie.genres : [];
    }

    const viewGenreCounts = await getViewGenreCounts(currentUser.id, movieGenreMap, excludedMovieIds);
    const watchlistGenreCounts = await getWatchlistGenreCounts(currentUser.username, movieGenreMap, excludedMovieIds);
    const history = await SearchHistory.findByIDandSort(String(currentUser.id));
    const searchGenreCounts = getSearchGenreCounts(history);
    const genreScores = getGenreScores(searchGenreCounts, watchlistGenreCounts, viewGenreCounts);
    const recommendedMovies = [];

    for (let movie of movies) {
        if (excludedMovieIds[String(movie.id)]) {
            continue;
        }

        const recommendationScore = getMovieRecommendationScore(movie, genreScores);

        if (recommendationScore > 0) {
            movie.recommendationScore = recommendationScore;
            recommendedMovies.push(movie);
        }
    }

    recommendedMovies.sort((movieA, movieB) => {
        if (movieB.recommendationScore !== movieA.recommendationScore) {
            return movieB.recommendationScore - movieA.recommendationScore;
        }

        return (movieB.rating || 0) - (movieA.rating || 0);
    });

    return recommendedMovies.slice(0, 6);
}

module.exports = { getRecommendedMovies, getLinearRegressionPrediction };
