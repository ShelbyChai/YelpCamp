const express = require("express");
const router = express.Router();
const multer = require("multer");

const { storage } = require("../cloudinary");
const upload = multer({ storage });
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");

router
    .route("/")
    .get(campgrounds.index)
    .post(isLoggedIn, upload.array("images"), validateCampground, catchAsync(campgrounds.create));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
    .route("/:id")
    .get(catchAsync(campgrounds.show))
    .put(
        isLoggedIn,
        isAuthor,
        upload.array("images"),
        validateCampground,
        catchAsync(campgrounds.update)
    )
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
