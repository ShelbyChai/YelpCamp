const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");

const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");
const { storeReturnTo } = require("../middleware");

router
    .route("/login")
    .get(users.renderLogin)
    .post(
        storeReturnTo,
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        users.login
    );

router
    .route("/register")
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.get("/logout", users.logout);

module.exports = router;
