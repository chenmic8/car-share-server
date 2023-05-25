var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Family = require("../models/Family");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

//ADMINS ONLY CAN GET ALL USERS REGARDLESS OF FAMILY
router.get("/all-users", async (req, res, next) => {
  console.log("GETTING USERS");
  try {
    const foundUsers = await User.find();
    res.json(foundUsers);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.get("/family-users/:familyId", async (req, res) => {
  console.log(req.params.familyId);
  try {
    const family = await Family.findById(req.params.familyId).populate("users");
    res.json(family.users);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.get("/details/:userId", async (req, res, next) => {
  console.log("GETTING SINGLE USER DETAILS");
  try {
    const foundUser = await User.findById(req.params.userId);
    res.json(foundUser);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//need password to change user
router.post("/update/:userId", async (req, res, next) => {
  console.log("UPDATING USER");
  const { currentPassword } = req.body;

  //if password matchs
  try {
    const foundUser = await User.findById(req.params.userId);
    const passwordCorrect = bcrypt.compareSync(
      currentPassword,
      foundUser.password
    );
    if (!passwordCorrect) {
      res.status(401).json({ message: "Incorrect password" });
      return;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      {
        new: true,
      }
    );
    console.log("UPDATED USER: ", updatedUser);
    res.json(updatedUser);
  } catch (error) {
    res
      .status(404)
      .json({ message: "A user with that email may already exist" });
  }
});

router.post("/update-password/:userId", async (req, res, next) => {
  console.log("UPDATING USER PASSWORD");
  const { currentPassword } = req.body;
  const { newPassword, repeatedNewPassword } = req.body;

  if (newPassword !== repeatedNewPassword) {
    res.status(400).json({ message: "Passwords don't match" });
    return;
  }
  try {
    const foundUser = await User.findById(req.params.userId);
    const passwordCorrect = bcrypt.compareSync(
      currentPassword,
      foundUser.password
    );
    if (!passwordCorrect) {
      res.status(401).json({ message: "Incorrect password" });
      return;
    }
    //hash new password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { password: hashedPassword },
      {
        new: true,
      }
    );
    console.log("UPDATED USER: ", updatedUser);
    res.json(updatedUser);
  } catch (error) {
    res
      .status(404)
      .json({ message: "A user with that email may already exist" });
  }
});

router.post("/delete/:userId", (req, res, next) => {
  User.findByIdAndDelete(req.params.userId).then((deletedUser) =>
    res.json(deletedUser)
  );
});

module.exports = router;
