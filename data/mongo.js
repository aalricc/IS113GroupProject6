const dns = require("dns");
const mongoose = require("mongoose");

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

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

module.exports = {
    pushToDB,
    Review,
};
