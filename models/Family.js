const { model, Schema } = require("mongoose");

const familySchema = new Schema(
  {
    name: {type: String, default: 'New Family'},
    cars: [{type: Schema.Types.ObjectId, ref: "Car"}],
    users: [{type: Schema.Types.ObjectId, ref: "User"}],
    address: {type: Schema.Types.ObjectId, ref: "Location"}
  },
  { timestamps: true, timeseries: true }
);

module.exports = model("Family", familySchema);
