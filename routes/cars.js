var express = require("express");
var router = express.Router();
const Car = require("../models/Car");
const Family = require("../models/Family");

//ADMINS ONLY CAN GET ALL CARS REGARDLESS OF FAMILY
router.get("/all-cars", async (req, res, next) => {
  console.log("GETTING CARS");
  try {
    const foundCars = await Car.find();
    res.json(foundCars);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.get("/details/:carId", async (req, res, next) => {
  console.log("GETTING SINGLE CAR DETAILS");
  try {
    const foundCar = await Car.findById(req.params.carId);
    res.json(foundCar);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.get("/family-cars/:familyId", async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId).populate("cars");
    res.json(family.cars);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.get("/details/:carId", async (req, res, next) => {
  console.log("GETTING SINGLE CAR DETAILS");
  try {
    const foundCar = await Car.findById(req.params.carId);
    res.json(foundCar);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.post("/create", async (req, res, next) => {
  console.log("CREATING CAR");
  try {
    const createdCar = await Car.create(req.body);
    res.json(createdCar);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//create car with family pointing to it
router.post("/create/:familyId", async (req, res, next) => {
  console.log("CREATING CAR");

  try {
    const createdCar = await Car.create(req.body);

    const newFamily = await Family.findOneAndUpdate(
      { _id: req.params.familyId },
      { $addToSet: { cars: createdCar._id } },
      { new: true, upsert: true }
    );

    res.json(createdCar);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.post("/update/:carId", async (req, res, next) => {
  console.log("UPDATING CAR", req.body, "with this id", req.params.carId);
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.carId, req.body, {
      new: true,
    });
    console.log("UPDATED CAR: ", updatedCar);
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.post("/delete/:carId", (req, res, next) => {
  Car.findByIdAndDelete(req.params.carId).then((deletedCar) =>
    res.json(deletedCar)
  );
});

module.exports = router;
