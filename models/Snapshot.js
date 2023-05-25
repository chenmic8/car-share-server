const { model, Schema } = require("mongoose");

const nowDate = new Date();
const date =
  nowDate.getFullYear() +
  "/" +
  (nowDate.getMonth() + 1) +
  "/" +
  nowDate.getDate();

const snapshotSchema = new Schema(
  {
    date: {
      type: String,
      default: date,
    },
    family: { type: Schema.Types.ObjectId, ref: "Family" },
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  },
  { timestamps: true, timeseries: true }
);

module.exports = model("Snapshot", snapshotSchema);
