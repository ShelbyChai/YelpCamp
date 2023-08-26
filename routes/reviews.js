const express = require("express");
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const review = require("../controllers/reviews");

// POST route
router.post("/", isLoggedIn, validateReview, catchAsync(review.create));

// DELETE route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    catchAsync(review.delete)
);

module.exports = router;
