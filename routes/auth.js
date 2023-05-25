var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Family = require("../models/Family");
const isAuthenticated = require("../middleware/isAuthenticated");

const { OAuth2Client } = require("google-auth-library");

const saltRounds = 10;

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);

/************************
 *
 *  sign up/login with google
 *
 ************************/
router.post("/google", async (req, res) => {
  let payload;
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
    var profileInfoBase64Url = tokens.id_token.split(".")[1];
    var decodedProfileInfo = JSON.parse(atob(profileInfoBase64Url));
    console.log("DECODEDPROFILEINFO", decodedProfileInfo);
    const { email, given_name, family_name, picture } = decodedProfileInfo;

    const userExists = await User.exists({ email: email });

    //IF USER DOES NOT EXIST CREATE FAMILY AND NEW USER
    if (!userExists) {
      const createdUser = await User.create({
        email: decodedProfileInfo.email,
        firstName: given_name,
        lastName: family_name,
        profilePic: picture,
        refreshToken: tokens.refresh_token,
      });

      payload = {
        _id: createdUser._id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        profilePic: createdUser.profilePic,
      };

      const newFamily = await Family.create({ users: [createdUser._id] });
    }

    //ELSE IF USER EXISTS, GET INFO AND
    else {
      const foundUser = await User.findOneAndUpdate(
        { email: decodedProfileInfo.email },
        { refreshToken: tokens.refresh_token },
        { new: true }
      );
      const {
        firstName,
        lastName,
        email,
        birthdate,
        phone,
        role,
        address,
        profilePic,
        _id,
      } = foundUser;
      payload = {
        _id,
        firstName,
        lastName,
        email,
        birthdate,
        phone,
        role,
        address,
        profilePic,
      };
    }
    const authToken = jwt.sign(payload, process.env.SECRET, {
      algorithm: "HS256",
      expiresIn: "10h",
    });
    res.status(201).json({
      authToken: authToken,
      user: payload,
      // accessToken: tokens.access_token,
    });

    // for basic auth
    // delete createdUser._doc.password

    // const authToken = jwt.sign({ payload: createdUser }, process.env.SECRET, {
    //   algorithm: "HS256",
    //   expiresIn: "1h",
    // });
    // console.log("PAYLOAD WITH USER INFO", createdUser);
    // res.status(201).json({
    //   authToken: authToken,
    //   user: createdUser,
    //   accessToken: tokens.access_token,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**************************************
 *
 *  SIGN UP with basic authentication
 *
 **************************************/
router.post("/signup", async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    birthdate,
    phone,
    role,
    // address, //ADD THIS WHEN MAPBOX IS IMPLEMENTED!!!!!!!!!!!!
  } = req.body;
  try {
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      res.status(400).json({ message: "User already exists." });
      return;
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthdate,
      phone,
      role,
      // address, //ADD THIS WHEN MAPBOX IS IMPLEMENTED!!!!!!!!!!
    });

    const newFamily = await Family.create({ users: [createdUser._id] });
    console.log("CREATED A NEW FAMILY: ", newFamily);

    const { _id, profilePic } = createdUser;
    const payload = {
      firstName,
      lastName,
      email,
      birthdate,
      phone,
      role,
      // address, //ADD THIS WHEN MAPBOX IS IMPLEMENTED!!!!!!!!!!
      profilePic,
      _id,
    };
    const authToken = jwt.sign(payload, process.env.SECRET, {
      algorithm: "HS256",
      expiresIn: "10h",
    });
    console.log("Signup with this payload: ", payload);
    res.status(201).json({ authToken: authToken, user: payload });
  } catch (error) {
    console.log("CONSOLE LOGGED CATCHED ERROR", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//LOGIN ROUTE MAY NEED ACCESS TOKEN RETRIEVAL IF LOGGED IN WITH ACCOUNT WITH GOOGLE OAUTH
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  console.log("PASSWORD GOT FROM FORM: ", password);
  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser.password) {
      res.status(400).json({
        message:
          "Please use google authentication and set a password in profile settings",
      });
      return;
    }
    const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
    if (!passwordCorrect) {
      res.status(401).json({ message: "Incorrect password or email" });
      return;
    }
    const {
      firstName,
      lastName,
      birthdate,
      phone,
      role,
      // address, //ADD THIS WHEN MAPBOX IS IMPLEMENTED!!!!!!!!!!!!
      profilePic,
      _id,
    } = foundUser;
    payload = {
      email,
      firstName,
      lastName,
      birthdate,
      phone,
      role,
      // address, //ADD THIS WHEN MAPBOX IS IMPLEMENTED!!!!!!!!!!!!
      profilePic,
      _id,
    };
    const authToken = jwt.sign(payload, process.env.SECRET, {
      algorithm: "HS256",
      expiresIn: "10h",
    });
    res.status(200).json({ authToken: authToken, user: payload });
  } catch (error) {
    console.log("LOGIN ERROR CATCH: ", error);
    res.status(401).json({ message: "Incorrect password or email" });
  }
});

router.get("/verify", isAuthenticated, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
