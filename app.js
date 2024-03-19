const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const memberRoutes = require("./routes/member")
const showcaseRoutes = require("./routes/showcase")


const app = express();

app.use(bodyParser.urlencoded());

app.use('/member', memberRoutes);
app.use('/showcase', showcaseRoutes);

app.use('/', (req, res) => {
  res.status(404).send("not found")
});
const server = http.createServer(app);

server.listen(3000);
