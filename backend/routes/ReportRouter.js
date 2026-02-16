const express = require("express");
const router = express.Router();
const { getSummary, getStockMovement } = require("../controllers/ReportController");
const { protect } = require("../middlewares/ProtectRouters");

router.get("/summary", protect, getSummary);
router.get("/stock-movement", protect, getStockMovement);

module.exports = router;
