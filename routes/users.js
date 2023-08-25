const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");

const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { storeToReturn, storeReturnTo } = require("../middleware");

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.get("/register", (req, res) => {
    res.render("users/register");
});

router.get("/logout", (req, res) => {
    req.logOut(function (err) {
        if (err) return next(err);

        req.flash("success", "Logged out successfully");
        res.redirect("/campgrounds");
    });
});

router.post(
    "/login",
    storeReturnTo,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
    }),
    (req, res) => {
        req.flash("success", "welcome back!");
        const redirectUrl = res.locals.returnTo || "/campgrounds";
        delete req.session.returnTo;

        res.redirect(redirectUrl);
    }
);

router.post(
    "/register",
    catchAsync(async (req, res) => {
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);

            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome to Yelp Camp!");
                res.redirect("/campgrounds");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/register");
        }
    })
);

module.exports = router;
