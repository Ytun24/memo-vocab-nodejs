const http = require("http");

const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");

const app = express();

app.use(bodyParser.json()); 

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
  })
);

mongoose
  .connect(
    "mongodb+srv://tunyaporns:ef3OO11xcSHlGQWB@clusterytun.iywh1dl.mongodb.net/memo-vocab?retryWrites=true&w=majority&appName=ClusterYtun"
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
