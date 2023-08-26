const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.show = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");
    console.log(campground);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
};

module.exports.create = async (req, res) => {
    // Basic rudimentary logic to see if request body contains campground data
    // if (!req.body.campground)
    //     throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();

    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.update = async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
};
