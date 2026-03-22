const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "A user must have username"],
        unique: true
    },
    password: {
        type: String,
        required : [true, "A user must have password"]
    },
    email: {
        type: String,
        required: [true, "A user must have email"],
        unique: true
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

// functions

//get all of the user in database
exports.retrieveAll = function() {
    return User.find();
};

exports.findOneUsername = function(username) {
    return User.findOne({username: username});
};

exports.createUser = function(userData) {
    return User.create(userData);
};

exports.findById = function(id){
    return User.findById(id);
};