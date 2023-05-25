var express = require("express");
var router = express.Router();
const Snapshot = require("../models/Snapshot");

/* GET home page. */
router.get("/all-snapshots", async (req, res, next) => {
  console.log("GETTING SNAPSHOTS");
  try {
    const foundSnapshots = await Snapshot.find();
    res.json(foundSnapshots);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.get("/family-snapshots/:familyId", async (req, res, next) => {
  console.log("GETTING SNAPSHOTS");
  try {
    const foundSnapshots = await Snapshot.find({ family: req.params.familyId }).populate('events').populate('family');
    res.json(foundSnapshots);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.get("/details/:snapshotId", async (req, res, next) => {
  console.log("GETTING SINGLE SNAPSHOT DETAILS");
  try {
    const foundSnapshot = await Snapshot.findById(req.params.snapshotId);
    res.json(foundSnapshot);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//create a snapshot for a family but if one already exists for that date, update the existing one
//request body should contain the new event to be added
router.post("/upsert/:familyID", async (req, res, next) => {
  const familyId = req.params.familyID;
  // console.log("request parameters: ", req.params.familyID);
  // console.log("family id", familyId);
  const { newEvent } = req.body;
  // console.log("NEW EVENT: ", newEvent);
  const nowDate = new Date();
  const date =
    nowDate.getFullYear() +
    "/" +
    (nowDate.getMonth() + 1) +
    "/" +
    nowDate.getDate();
  try {
    const upsertedSnapshot = await Snapshot.findOneAndUpdate(
      {
        date: date,
        family: familyId,
      },
      { $addToSet: { events: newEvent } },
      { new: true, upsert: true }
    );
    res.json(upsertedSnapshot);

    // const snapshotExists = await Snapshot.exists({
    //   date: date,
    //   family: familyId,
    // });
    // if (snapshotExists) {
    //   const foundSnapshot = await Snapshot.findOne({
    //     date: date,
    //     family: familyId,
    //   });

    //   if (foundSnapshot.events.includes(newEvent)) {
    //     res.status(400).json({
    //       message: "already existing snapshot already has this event",
    //     });
    //     return;
    //   } else if (foundSnapshot) {
    //     console.log("UPDATING EXISTING SNAPSHOT");
    //     let snapshotDeepcopy = JSON.parse(JSON.stringify(foundSnapshot));
    //     snapshotDeepcopy.events.push(newEvent);
    //     const updatedSnapshot = await Snapshot.findByIdAndUpdate(
    //       foundSnapshot._id,
    //       snapshotDeepcopy,
    //       { new: true }
    //     );
    //     res.json(updatedSnapshot);
    //     return;
    //   }
    // }
    // console.log("CREATING BRAND NEW SNAPSHOT FOR THIS FAMILY");
    // const createdSnapshot = await Snapshot.create({
    //   date: date,
    //   events: newEvent,
    //   family: familyId,
    // });
    // res.json(createdSnapshot);
    
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.post("/delete/:snapshotId", (req, res, next) => {
  Snapshot.findByIdAndDelete(req.params.snapshotId).then((deletedSnapshot) =>
    res.json(deletedSnapshot)
  );
});

module.exports = router;
