const express = require("express");
const router = express.Router();
const { exportProductsPDF, exportProductsExcel } = require("../controllers/ExportController");
const { protect } = require("../middlewares/ProtectRouters");

router.get("/products/pdf", protect, exportProductsPDF);
router.get("/products/excel", protect, exportProductsExcel);

module.exports = router;
