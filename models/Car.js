const { model, Schema } = require("mongoose");

const carSchema = new Schema(
  {
    make: { type: String, required: true },
    model: { type: String },
    color: {
      type: String,
      enum: ["Black", "White", "Gray", "Silver", "Blue", "Red", "Other"],
      default: "Gray",
    },
    year: { type: Number },
  },
  { timestamps: true, timeseries: true }
);

module.exports = model("Car", carSchema);
