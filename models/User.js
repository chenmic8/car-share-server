const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    birthdate: { type: Date },
    phone: { type: Number },
    role: {
      type: String,
      enum: ["admin", "driver", "rider", "owner"],
      default: "rider",
    },
    // address: { type: Schema.Types.ObjectId, ref: "Location" },
    profilePic: {
      type: String,
      default:
        "https://austinpeopleworks.com/wp-content/uploads/2020/12/blank-profile-picture-973460_1280-300x300.png",
    },
    locations: [{ type: Schema.Types.ObjectId, ref: "Location" }],
    refreshToken: String,
  },
  { timestamps: true, timeseries: true }
);

module.exports = model("User", userSchema);
