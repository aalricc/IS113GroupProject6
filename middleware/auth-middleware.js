exports.checkIfLogged = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/login");
    }
    next();
};

exports.checkIfAdmin = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.redirect("/login");
    }
    next();
};