const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

const main = async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
};

// Connects to MongoDB
main().catch((err) => console.log(err));

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    // Format the database
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "64e71a8ee61177a3fc1b84b7",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [
                {
                    url: "https://res.cloudinary.com/dpgwm9vzw/image/upload/v1693186826/YelpCamp/lo0fsorduub5jq27xx4l.avif",
                    filename: "YelpCamp/lo0fsorduub5jq27xx4l",
                },
                {
                    url: "https://res.cloudinary.com/dpgwm9vzw/image/upload/v1693186831/YelpCamp/oijj0lli4r4rkk6yhoiv.avif",
                    filename: "YelpCamp/oijj0lli4r4rkk6yhoiv",
                },
            ],

            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo, deleniti, necessitatibus quod incidunt accusamus ea reiciendis blanditiis fugit fugiat corrupti delectus illo obcaecati id mollitia unde ad maiores minus hic.",
            price,
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
