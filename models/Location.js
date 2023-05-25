const { model, Schema } = require("mongoose");
const mongoose = require("mongoose");

const locationSchema = new Schema(
  {
    type: { type: String, enum: ["residential", "other"], default: "other" },
    name: { type: String },
    address: { type: String },
    placeFormatted: { type: String },
    fullAddress: { type: String },
    coordinates: {
      latitude: { type: mongoose.Types.Decimal128, required: true },
      longitude: { type: mongoose.Types.Decimal128, required: true },
    },
  },
  { timestamps: true, timeseries: true }
);

module.exports = model("Location", locationSchema);
