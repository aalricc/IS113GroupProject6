const { Review } = require("../models/moviereviews-model");
const User = require("../models/user")


exports.showAdminPage = async (req, res) => {
    try {
        const reviews = await Review.find();
        const users = await User.retrieveAll();

        res.render("admin", { reviews, users });
    } catch (error) {
        console.error("Error occured fetching admin data", error);
        res.status(500).send("Error loading admin page");
    }
};

exports.deleteReviewAsAdmin = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.reviewId);
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
      //  res.send('Update successful!')
        res.redirect("/admin-page");
    } catch (error) {
        console.error("Error updating user", error);
        res.status(500).send("Could not update user");
    }
};