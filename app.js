const http = require("http");

const express = require("express");

const app = express();

app.use((req, res, next) => {
  res.write("<html>");
  res.write("<h1>Welcome!</h1>");
  res.write("</html>");
  res.end();
});

const server = http.createServer(app);

server.listen(3000);
