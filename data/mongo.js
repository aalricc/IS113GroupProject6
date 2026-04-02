const mongoose = require("mongoose");
const { Review } = require("../models/moviereviews-model");
const { MovieCache } = require("../models/movie-cache-model");

async function connectDB() {
    try {
        await mongoose.connect(process.env.DB);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }

}
async function pushToDB(Model, data) {
    const document = new Model(data);
    return await document.save();
}

async function readFromDB(Model, query = {}) {
    return await Model.find(query);
}

async function readOneFromDB(Model, query = {}) {
    return await Model.findOne(query);
}

async function updateInDB(Model, filter, updatedData) {
    return await Model.updateOne(filter, updatedData);
}

async function deleteFromDB(Model, filter) {
    return await Model.deleteOne(filter);
}

module.exports = {
    connectDB,
    pushToDB,
    readFromDB,
    readOneFromDB,
    updateInDB,
    deleteFromDB,
    Review,
    MovieCache
};
