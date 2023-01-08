const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [4, "Name should be minimum of 4 characters"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: [8, "Password must be minimum of 8 characters"],
  },
  token: {
    type: String,
  },
});
//create model
const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
