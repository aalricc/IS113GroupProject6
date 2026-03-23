const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.DB);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

async function pushToDB(Model, data) {
    await connectDB();
    const document = new Model(data);
    return await document.save();
}

async function readFromDB(Model, query = {}) {
    await connectDB();
    return await Model.find(query);
}

async function readOneFromDB(Model, query = {}) {
    await connectDB();
    return await Model.findOne(query);
}

async function updateInDB(Model, filter, updatedData) {
    await connectDB();
    return await Model.updateOne(filter, updatedData);
}

async function deleteFromDB(Model, filter) {
    await connectDB();
    return await Model.deleteOne(filter);
}

const reviewSchema = new mongoose.Schema({
    movieId: String,
    reviewContent: String,
    rating: String,
    userId: String,
    username: String
});

const movieCacheSchema = new mongoose.Schema({
    cacheKey: {
        type: String,
        required: true,
        unique: true
    },
    movies: {
        type: Array,
        default: []
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
const MovieCache = mongoose.models.MovieCache || mongoose.model("MovieCache", movieCacheSchema);

module.exports = {
    pushToDB,
    readFromDB,
    readOneFromDB,
    updateInDB,
    deleteFromDB,
    User,
    Review,
    MovieCache,
};
