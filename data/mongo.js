const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Review } = require("../models/moviereviews-model");
const { MovieCache } = require("../models/movie-cache-model");
const dns = require('dns');
dns.setServers(['8.8.8.8']);
dotenv.config({path: "./config.env"});

let connectionPromise;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.DB).then(() => {
            console.log("MongoDB connected successfully");
            return mongoose.connection;
        }).catch((error) => {
            connectionPromise = null;
            throw error;
        });
    }

    return connectionPromise;
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
