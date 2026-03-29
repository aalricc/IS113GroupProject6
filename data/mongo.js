const mongoose = require("mongoose");
const { Review } = require("../models/moviereviews-model");
const { MovieCache } = require("../models/movie-cache-model");
const dns = require('dns');
dns.setServers(['8.8.8.8']);


let connectionPromise;

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
