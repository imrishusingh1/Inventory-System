const express = require("express");
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStockProducts
} = require("../controllers/ProductController");
const { protect } = require("../middlewares/ProtectRouters");
const { adminOnly } = require("../middlewares/AdminMiddleware");

// Routes
router.route("/")
    .get(protect, getProducts)
    .post(protect, adminOnly, createProduct);

// Specific routes must come before /:id to avoid collision if they look like IDs (though "low-stock" is string vs ID)
// But best practice is specific first
router.get("/low-stock", protect, getLowStockProducts);

router.route("/:id")
    .get(protect, getProductById)
    .put(protect, adminOnly, updateProduct)
    .delete(protect, adminOnly, deleteProduct);

module.exports = router;
