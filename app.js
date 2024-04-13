const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

const app = express();
const vocabRouters = require("./routes/vocab");
const authRoutes = require("./routes/auth")

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("", vocabRouters);
app.use("", authRoutes);

app.use((error, req, res, next) => {
  if (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
});

mongoose
  .connect(
    "mongodb+srv://tunyaporns:ef3OO11xcSHlGQWB@clusterytun.iywh1dl.mongodb.net/memo-vocab?retryWrites=true&w=majority&appName=ClusterYtun"
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
