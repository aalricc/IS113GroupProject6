const dns = require("dns");
const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://lucasleow2025_db_user:x3kAH8gbmTu5tWZl@main.a7dfili.mongodb.net/is113project?retryWrites=true&w=majority";

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    dns.setServers(["8.8.8.8", "1.1.1.1"]); //my network needs this
    await mongoose.connect(MONGO_URI);
    return mongoose.connection;
}

async function disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
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
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const reviewSchema = new mongoose.Schema({
    movieId: String,
    reviewContent: String,
    userId: String,
    username: String
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

module.exports = {
    MONGO_URI,
    connectDB,
    disconnectDB,
    User,
    Review,
};
