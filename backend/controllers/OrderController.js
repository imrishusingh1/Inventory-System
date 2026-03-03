const asyncHandler = require("../utils/AsyncHandler");
const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");

// @desc    Place an order (customer)
// @route   POST /api/orders
// @access  Private (customer)
const placeOrder = asyncHandler(async (req, res) => {
    const { adminUsername, items, note } = req.body;
    // items: [{ productId, quantity }]

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error("No items in order");
    }

    // Find admin by username
    const admin = await User.findOne({ username: adminUsername.toLowerCase(), role: "admin" });
    if (!admin) {
        res.status(404);
        throw new Error("Admin store not found");
    }

    // Validate each item and build order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findOne({ _id: item.productId, user: admin._id });
        if (!product) {
            res.status(404);
            throw new Error(`Product ${item.productId} not found in this store`);
        }
        if (product.quantity < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for "${product.name}". Available: ${product.quantity}`);
        }
        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;
        orderItems.push({
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            priceAtOrder: product.price,
        });
    }

    const order = await Order.create({
        customer: req.user._id,
        admin: admin._id,
        items: orderItems,
        totalAmount,
        note,
    });

    const populated = await order.populate([
        { path: "admin", select: "name username" },
        { path: "items.product", select: "name category" },
    ]);

    res.status(201).json(populated);
});

// @desc    Get customer's own orders
// @route   GET /api/orders/my
// @access  Private (customer)
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user._id })
        .populate("admin", "name username")
        .populate("items.product", "name category")
        .sort("-createdAt");
    res.status(200).json(orders);
});

// @desc    Get all orders for an admin's products
// @route   GET /api/orders/admin
// @access  Private (admin)
const getAdminOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ admin: req.user._id })
        .populate("customer", "name email username")
        .populate("items.product", "name category")
        .sort("-createdAt");
    res.status(200).json(orders);
});

// @desc    Update an order status (confirm/reject)
// @route   PUT /api/orders/:id/status
// @access  Private (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!["confirmed", "rejected"].includes(status)) {
        res.status(400);
        throw new Error("Invalid status. Must be 'confirmed' or 'rejected'");
    }

    const order = await Order.findOne({ _id: req.params.id, admin: req.user._id });
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (order.status !== "pending") {
        res.status(400);
        throw new Error("Order has already been processed");
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: `Order ${status}`, order });
});

module.exports = {
    placeOrder,
    getMyOrders,
    getAdminOrders,
    updateOrderStatus,
};
