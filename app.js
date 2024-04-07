const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const vocabRouters = require("./routes/vocab");

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

app.use("", vocabRouters);

mongoose
  .connect(
    "mongodb+srv://tunyaporns:ef3OO11xcSHlGQWB@clusterytun.iywh1dl.mongodb.net/memo-vocab?retryWrites=true&w=majority&appName=ClusterYtun"
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
