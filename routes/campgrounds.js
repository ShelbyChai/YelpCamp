const express = require("express");
const router = express.Router();

const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");

router
    .route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.create));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
    .route("/:id")
    .get(catchAsync(campgrounds.show))
    .put(
        isLoggedIn,
        isAuthor,
        validateCampground,
        catchAsync(campgrounds.update)
    )
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
