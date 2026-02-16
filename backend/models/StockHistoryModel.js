const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["IN", "OUT"],
        },
        quantity: {
            type: Number,
            required: true,
        },
        reason: {
            type: String, // e.g., "Purchase", "Sale", "Damage", "Return"
            required: false,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("StockHistory", stockHistorySchema);
