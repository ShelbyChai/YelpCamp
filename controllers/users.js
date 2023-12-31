const User = require("../models/user");

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

module.exports.login = (req, res) => {
    req.flash("success", `Welcome Back ${req.user.username}!`);
    const redirectUrl = res.locals.returnTo || "/";
    delete req.session.returnTo;

    res.redirect(redirectUrl);
};

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/");
    }
};

module.exports.logout = (req, res) => {
    req.logOut(function (err) {
        if (err) return next(err);

        req.flash("success", "Logged out successfully");
        res.redirect("/");
    });
};
