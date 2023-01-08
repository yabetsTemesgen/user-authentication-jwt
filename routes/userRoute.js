const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middleware/authenticate");
const route = express.Router();
const userModel = require("../models/userModel");

route.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ message: "please enter all the details" });
    }
    //checking if user already exists
    const userExist = await userModel.findOne({ email: req.body.email });
    if (userExist) {
      return res.json({ message: "User with the given email already exists" });
    }
    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashpassword;
    const user = new userModel(req.body);
    await user.save();
    const token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    return res.cookie({ token: token }).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    return res.json({ error: error });
  }
});
route.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "Please enter all the details" });
    }
    const userExist = await userModel.findOne({ email: req.body.email });
    if (!userExist) {
      return res.json({ message: "Wrong credentials" });
    }
    //checking if password match
    const isPasswordMatched = await bcrypt.compare(
      password,
      userExist.password
    );
    if (!isPasswordMatched) {
      return res.json({ message: "Wrong credentials pass" });
    }
    const token = await jwt.sign(
      { id: userExist._id },
      process.env.SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );
    return res
      .cookie({ token: token })
      .json({ success: true, message: "LoggedIn Successfully" });
  } catch (error) {
    return res.json({ error: error });
  }
});
route.get("/user", isAuthenticated, async (req, res) => {
  try {
    const user = await userModel.find();
    if (!user) {
      return res.json({ message: "No user found" });
    }
    return res.json({ user: user });
  } catch (error) {
    return res.json({ error: error });
  }
});

module.exports = route;
