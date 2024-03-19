const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use((req, res, next) => {
  res.write("<html>");
  res.write("<h1>Welcome!</h1>");
  res.write("</html>");
  res.end();
});
app.use(bodyParser.urlencoded());

const server = http.createServer(app);

server.listen(3000);
