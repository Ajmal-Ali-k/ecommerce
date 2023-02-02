const mongoose = require("mongoose");
const { isEmail } = require("validator");

const UserSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail,"please enter valid email"]
  },
  phoneNo: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "please enter an password"]
  },
  created: {
    type: Date,
    default: Date(),
  },
  block: {
    type: Boolean,
    default: false,
  },
});

//user collection

const User = mongoose.model("User", UserSchema);

module.exports = User;
