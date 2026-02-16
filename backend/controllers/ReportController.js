const mongoose = require("mongoose");
const asyncHandler = require("../utils/AsyncHandler");
const Product = require("../models/ProductModel");
const StockHistory = require("../models/StockHistoryModel");

// @desc    Get Inventory Summary
// @route   GET /api/reports/summary
// @access  Private
const getSummary = asyncHandler(async (req, res) => {
    // Consistency is key: Use the same ID format across all controllers
    const userId = req.user.id;
    
    // 1. Fetch all products for this user
    const products = await Product.find({ user: userId });
    
    // 2. Calculate Stats manually to ensure maximum reliability
    let totalStoreValue = 0;
    const categoryMap = {};
    let outOfStockCount = 0;
    let lowStockCount = 0;

    products.forEach(p => {
        totalStoreValue += (Number(p.price) || 0) * (Number(p.quantity) || 0);
        if (p.quantity === 0) outOfStockCount++;
        if (p.quantity <= (p.minStock || 0) || p.quantity <= 10) lowStockCount++;
        
        const cat = p.category && p.category.trim() !== "" ? p.category : 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryStats = Object.keys(categoryMap).map(name => ({
        _id: name,
        count: categoryMap[name]
    }));

    // 3. Fetch Stock Movement for current user
    const history = await StockHistory.find({ user: userId });
    const movementMap = { 'IN': 0, 'OUT': 0 };

    history.forEach(h => {
        if (movementMap[h.type] !== undefined) {
            movementMap[h.type] += (Number(h.quantity) || 0);
        }
    });

    const stockMovement = Object.keys(movementMap)
        .map(type => ({
            _id: type,
            totalQuantity: movementMap[type]
        }))
        .filter(item => item.totalQuantity >= 0); // Keep 0s so the chart renders empty bars instead of "No data"

    res.status(200).json({
        totalProducts: products.length,
        totalStoreValue,
        outOfStock: outOfStockCount,
        lowStockCount,
        categoryStats,
        stockMovement,
        // Diagnostic field to verify ownership
        userId: userId
    });
});

// @desc    Get Stock Movement Analytics
// @route   GET /api/reports/stock-movement
// @access  Private
const getStockMovement = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const history = await StockHistory.find({ user: userId });
    
    const stats = {
        'IN': { _id: 'IN', totalQuantity: 0, count: 0 },
        'OUT': { _id: 'OUT', totalQuantity: 0, count: 0 }
    };

    history.forEach(h => {
        if (stats[h.type]) {
            stats[h.type].totalQuantity += (Number(h.quantity) || 0);
            stats[h.type].count += 1;
        }
    });

    res.status(200).json(Object.values(stats));
});

module.exports = {
    getSummary,
    getStockMovement
};
