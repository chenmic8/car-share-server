var express = require("express");
var router = express.Router();
const Location = require("../models/Location");
const Family = require("../models/Family");


router.get("/all-locations", async (req, res, next) => {
  console.log("GETTING LOCATIONS");
  try {
    const foundLocations = await Location.find();
    res.json(foundLocations);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});


router.get("/family-locations/:familyId", async (req, res, next) => {
  console.log("GETTING LOCATIONS");
  try {
    const foundFamily = await Family.findById(req.params.familyId).populate({
      path: "users",
      populate: { path: "locations" },
    });
    let familyLocations = [];
    for (user of foundFamily.users) {
      if (user.locations) {
        familyLocations = familyLocations.concat(user.locations);
      }
    }
    res.json(familyLocations);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.get("/details/:locationId", async (req, res, next) => {
  console.log("GETTING SINGLE LOCATION DETAILS");
  try {
    const foundLocation = await Location.findById(req.params.locationId);
    res.json(foundLocation);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.post("/create", async (req, res, next) => {
  try {
    // console.log('CREATE LOCATION REQ BODY: ', req.body);
    const createdLocation = await Location.create(req.body);
    res.json(createdLocation);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.post("/update/:locationId", async (req, res, next) => {
  console.log("UPDATING LOCATION");
  try {
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.locationId,
      req.body,
      {
        new: true,
      }
    );
    console.log("UPDATED LOCATION: ", updatedLocation);
    res.json(updatedLocation);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.post("/delete/:locationId", async (req, res, next) => {
  console.log("DELETING LOCATION");
  const deletedLocation = await Location.findByIdAndDelete(
    req.params.locationId
  );
  res.json(deletedLocation);
});

module.exports = router;
