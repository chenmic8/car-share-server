var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
var carsRouter = require("./routes/cars");
var eventsRouter = require("./routes/events");
var locationsRouter = require("./routes/locations");
var familiesRouter = require("./routes/families");
var snapshotsRouter = require("./routes/snapshots");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1);
app.enable("trust proxy");

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/cars", carsRouter);
app.use("/events", eventsRouter);
app.use("/locations", locationsRouter);
app.use("/families", familiesRouter);
app.use("/snapshots", snapshotsRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });

module.exports = app;
