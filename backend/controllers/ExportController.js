const asyncHandler = require("../utils/AsyncHandler");
const Product = require("../models/ProductModel");
const PDFDocument = require("pdfkit");
const xlsx = require("xlsx");

// @desc    Export Products to PDF
// @route   GET /api/export/products/pdf
// @access  Private
const exportProductsPDF = asyncHandler(async (req, res) => {
    const products = await Product.find({ user: req.user.id }).sort("-createdAt");

    const doc = new PDFDocument();

    // Set response headers
    const filename = `products-${Date.now()}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");

    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc.fontSize(20).text("Your Product Inventory List", { align: "center" });
    doc.moveDown();

    products.forEach((product, index) => {
        doc.fontSize(12).text(
            `${index + 1}. ${product.name} - Price: ₹${product.price} - Qty: ${product.quantity} - Category: ${product.category}`
        );
        doc.moveDown(0.5);
    });

    doc.end();
});

// @desc    Export Products to Excel
// @route   GET /api/export/products/excel
// @access  Private
const exportProductsExcel = asyncHandler(async (req, res) => {
    const products = await Product.find({ user: req.user.id }).sort("-createdAt");

    // Map data for clean Excel columns
    const data = products.map(p => ({
        Name: p.name,
        Category: p.category,
        Price: p.price,
        Quantity: p.quantity,
        MinStock: p.minStock,
        Value: p.price * p.quantity,
        CreatedAt: p.createdAt ? p.createdAt.toISOString().split("T")[0] : ""
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Products");

    // Generate buffer
    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `products-${Date.now()}.xlsx`;
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.send(excelBuffer);
});

module.exports = {
    exportProductsPDF,
    exportProductsExcel
};
