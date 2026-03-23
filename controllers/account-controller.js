const User = require(".././models/user");

// read portion
exports.showAccountPage = async (req, res)=>{
    try {
        const user = await User.findById(req.session.currentUser.id);

        if (!user) {
            return res.redirect("/login");
        }

        res.render('account', {
            user,
            isAdmin: req.session.isAdmin || false
        });
    } catch (error) {
        console.log("Account page error:", error);
        res.status(500).send("Server error");
    }
};

exports.showUpdateUsernamePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.currentUser.id);

        if (!user) {
            return res.redirect("/login");
        }

        res.render("update-username", {
            user,
            errors: [],
            success: null
        });
    } catch (error) {
        console.log("Show update username page error: ", error);
        res.status(500).send("Server error");
    }
};

exports.updateUsername = async (req, res) => {
    const newUsername = req.body.username;
    let errors = [];

    if (!newUsername || newUsername.trim() === "") {
        errors.push("Username cannot be empty");
    }

    if (newUsername && newUsername.length < 3) {
        errors.push("Username must be at least 3 characters");
    }

    try {
        const currentUser = await User.findById(req.session.currentUser.id);

        if (!currentUser) {
            return res.redirect("/login");
        }

        const existingUser = await User.findOneUsername(newUsername);

        // check if newUsername exists in the database
        if (existingUser && String(existingUser._id) !== String(currentUser._id)){
            errors.push("Username already exists, try another one.");
        }

        // check if newUsername is same as currentUser username
        else if (newUsername.trim() === currentUser.username){
            errors.push("Please try a different username")
        }

        if (errors.length > 0) {
            return res.render("update-username", {
                errors,
                user: currentUser,
                success: null
            });
        }

        // update username in db
        const updatedUser = await User.findByIdAndUpdate(
            req.session.currentUser.id,
            {username: newUsername},
            {new: true}
        );

        // update username in session
        req.session.currentUser.username = updatedUser.username;

        return res.render("update-username", {
            user: updatedUser,
            errors: [],
            success: "Username updated succesfully. Click 'Back to Account' below to return back."
        });
    } catch (error) {
        console.log("Update username error: ", error);
        res.status(500).send("Server Error");
    }
};

exports.showUpdateEmailPage = async (req, res) => {
    try {
        const user = await User.findById(req.session.currentUser.id);

        if (!user) {
            return res.redirect("/login");
        }

        return res.render("update-email", {
            user,
            errors: [],
            success: null
        });
    } catch (error) {
        console.log("Show update email page error:", error);
        return res.status(500).send("Server error");
    }
};

exports.updateEmail = async (req, res) => {
    const newEmail = req.body.email.trim();
    let errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newEmail || newEmail === "") {
        errors.push("Email cannot be empty.");
    }

    if (!emailRegex.test(newEmail)) {
        errors.push("Invalid email format.");
    }

    try {
        const currentUser = await User.findById(req.session.currentUser.id);

        if (!currentUser) {
            return res.redirect("/login");
        }

        const existingUser = await User.findOneEmail(newEmail);

        if (newEmail === currentUser.email) {
            errors.push("Please try a different email.");
        } else if (existingUser && String(existingUser.id) !== String(currentUser.id)) {
            errors.push("Email already exists, try another one.");
        }

        if (errors.length > 0) {
            return res.render("update-email", {
                user: currentUser,
                errors,
                success: null
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.currentUser.id,
            { email: newEmail },
            { new: true }
        );

        return res.render("update-email", {
            user: updatedUser,
            errors: [],
            success: "Email updated successfully."
        });
    } catch (error) {
        console.log("Update email error:", error);
        return res.status(500).send("Server error");
    }
};

exports.showChangePasswordPage = async(req, res) => {
    try{
        const user = await User.findById(req.session.currentUser.id);

        if (!user) {
            return res.redirect("/login");
        }

        return res.render("change-password", {
            user,
            errors: [],
            success: null
        });
    } catch (error) {
        console.log("Show change password page error:", error);
        return res.status(500).send("Server error");
    }
};

exports.changePassword = async (req, res) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;

    let errors = [];

    try {
        const user = await User.findById(req.session.currentUser.id);

        if (!user) {
            return res.redirect("/login");
        }

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            errors.push("All fields are required.");
        }

        if (currentPassword !== user.password) {
            errors.push("Current password is incorrect.");
        }

        if (newPassword.length < 6) {
            errors.push("New password must be at least 6 characters.");
        }

        if (newPassword !== confirmNewPassword) {
            errors.push("New passwords do not match.");
        }

        if (newPassword === user.password) {
            errors.push("Please choose a different password.");
        }

        if (errors.length > 0) {
            return res.render("change-password", {
                user,
                errors,
                success: null
            });
        }

        // update password in db
        user.password = newPassword;
        await user.save();

        return res.render("change-password", {
            user,
            errors: [],
            success: "Password updated successfully."
        });    
    } catch (error) {
        console.log("Change Password error: ", error);
        return res.status(500).send("Server Error");
    }
};

exports.showDeleteAccountPage = async (req, res) => {
    try {
        const user = await User.findById(req.session.currentUser.id);

        if (!user) {
            return res.redirect("/login");
        }

        return res.render("delete-account", {
            user
        });
    } catch (error) {
        console.log("Show delete account page error:", error);
        return res.status(500).send("Server error");
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.session.currentUser.id);

        if (!user) {
            return res.redirect("/login");
        }

        // delete user in database
        await User.findByIdAndDelete(req.session.currentUser.id);

        // delete session
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destroy error:", err);
                return res.status(500).send("Could not log out after deletion");
            }

                res.clearCookie("connect.sid");
            return res.redirect("/");
        });
    } catch (error) {
        console.log("Delete account error:", error);
        return res.status(500).send("Server error");
    }
};

