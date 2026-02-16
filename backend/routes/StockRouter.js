const express = require("express");
const router = express.Router();
const {
    stockIn,
    stockOut,
    getStockHistory
} = require("../controllers/ProductController");
const { protect } = require("../middlewares/ProtectRouters");

// Routes
router.post("/in", protect, stockIn);
router.post("/out", protect, stockOut);
router.get("/history", protect, getStockHistory);

module.exports = router;
