const express = require("express");
const router = express.Router();
const { searchAdmins, getAdminProducts } = require("../controllers/PublicController");

router.get("/admins", searchAdmins);
router.get("/admins/:username/products", getAdminProducts);

module.exports = router;
