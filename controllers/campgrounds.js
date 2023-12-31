const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgroundPerPage = 28;
    const { page = 1 } = req.query;

    const campgrounds = await Campground.find({})
        .limit(campgroundPerPage * 1)
        .skip((page - 1) * campgroundPerPage);

    const count = await Campground.countDocuments();
    res.render("campgrounds/index", {
        campgrounds,
        totalPages: Math.ceil(count / campgroundPerPage),
        page,
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.show = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");

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
    const campground = new Campground(req.body.campground);
    const geoData = await geocodingClient
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send();

    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
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
    const newImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));

    campground.images.push(...newImages);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }

    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
};
