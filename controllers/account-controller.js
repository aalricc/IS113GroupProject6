const User = require(".././models/user");

// read portion
exports.showAccountPage = async (req, res)=>{
    if (!req.session.isLoggedIn) {
        return res.redirect("/login");
    }

    try {
        const user = await User.findById(req.session.currentUser.id);

        if (!user) {
            return res.redirect("/login");
        }

        res.render('account', {
            user
        });
    } catch (error) {
        console.log("Account page error:", error);
        res.status(500).send("Server error");
    }
}