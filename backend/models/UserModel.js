const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
   name: {
       type: String,
       required: true
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
       enum: ["staff", "admin"],
       default: "staff"
   }
},{timestamps: true});

// Export the model 
module.exports = mongoose.model("User", userSchema);
