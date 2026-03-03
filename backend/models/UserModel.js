const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false,
        unique: true,
        sparse: true,       // allows multiple docs to have null/undefined username
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["staff", "admin", "customer"],
        default: "staff"
    }
}, { timestamps: true });

// Export the model 
module.exports = mongoose.model("User", userSchema);
