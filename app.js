const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const vocabRouters = require("./routes/vocab");

app.use(bodyParser.json());

app.use("", vocabRouters);

app.listen(3000);
