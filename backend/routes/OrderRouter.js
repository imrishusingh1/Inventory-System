const express = require("express");
const router = express.Router();
const { placeOrder, getMyOrders, getAdminOrders, updateOrderStatus } = require("../controllers/OrderController");
const { protect } = require("../middlewares/ProtectRouters");
const { adminOnly } = require("../middlewares/AdminMiddleware");

router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/admin", protect, adminOnly, getAdminOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
