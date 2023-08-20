const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError");
const { campgroundSchema, reviewSchema } = require("./schemas");
const catchAsync = require("./utils/catchAsync");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");

const main = async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
};

// Connects to MongoDB
main().catch((err) => console.log(err));

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Validation Middleware
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((e) => e.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map((e) => e.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// Listen to port 3000
app.listen(3000, () => {
    console.log("Serving on port 3000");
});

// GET route
app.get("/", (req, res) => {
    res.render("home");
});

app.get(
    "/campgrounds",
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.get(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id).populate(
            "reviews"
        );
        res.render("campgrounds/show", { campground });
    })
);

app.get(
    "/campgrounds/:id/edit",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", { campground });
    })
);

// POST route
app.post(
    "/campgrounds",
    validateCampground,
    catchAsync(async (req, res) => {
        // Basic rudimentary logic to see if request body contains campground data
        // if (!req.body.campground)
        //     throw new ExpressError("Invalid Campground Data", 400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.post(
    "/campgrounds/:id/reviews",
    validateReview,
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);

        campground.reviews.push(review);
        await review.save();
        await campground.save();

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// PUT route
app.put(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
        });

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// DELETE route
app.delete(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");
    })
);

app.delete(
    "/campgrounds/:id/reviews/:reviewId",
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });
        await Review.findByIdAndDelete(req.params.reviewId);

        res.redirect(`/campgrounds/${id}`);
    })
);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error", { err });
});
