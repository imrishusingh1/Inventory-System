const asyncHandler = require("../utils/AsyncHandler");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");

// @desc    Search admins by username (partial match)
// @route   GET /api/public/admins?username=<query>
// @access  Public
const searchAdmins = asyncHandler(async (req, res) => {
    const { username } = req.query;

    const filter = { role: "admin" };
    if (username) {
        filter.username = { $regex: username.toLowerCase(), $options: "i" };
    }

    const admins = await User.find(filter).select("name username createdAt").limit(20);
    res.status(200).json(admins);
});

// @desc    Get a specific admin's public product catalog
// @route   GET /api/public/admins/:username/products
// @access  Public
const getAdminProducts = asyncHandler(async (req, res) => {
    const admin = await User.findOne({
        username: req.params.username.toLowerCase(),
        role: "admin",
    }).select("name username");

    if (!admin) {
        res.status(404);
        throw new Error("Admin store not found");
    }

    const products = await Product.find({ user: admin._id, quantity: { $gt: 0 } })
        .select("name sku category price quantity description supplier")
        .sort("-createdAt");

    res.status(200).json({ admin, products });
});

module.exports = { searchAdmins, getAdminProducts };
