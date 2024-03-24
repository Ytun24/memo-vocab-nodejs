const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const memberRoutes = require("./routes/member");
const showcaseRoutes = require("./routes/showcase");

const sequelize = require('./util/database');

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/member", memberRoutes);
app.use("/showcase", showcaseRoutes);

app.use("/", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});
const server = http.createServer(app);

sequelize
  .sync()
  .then((result) => {
    // console.log(result);
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
