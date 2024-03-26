const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const memberRoutes = require("./routes/member");
const showcaseRoutes = require("./routes/showcase");
const favoriteRoutes = require("./routes/favorite");

const sequelize = require('./util/database');
const Vocab = require('./models/vocab');
const User = require('./models/user');
const Favorite = require("./models/favorite");
const FavoriteItem = require("./models/favorite-item");

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

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user; 
      next();
    })
    .catch(err => console.log(err));
});

app.use("/member", memberRoutes);
app.use("/favorite", favoriteRoutes);
app.use("/showcase", showcaseRoutes);

app.use("/", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

Vocab.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Vocab);

User.hasOne(Favorite);
Favorite.belongsTo(User);
Favorite.belongsToMany(Vocab, { through: FavoriteItem });
Vocab.belongsToMany(Favorite, { through: FavoriteItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: 'Ying', email: 'test@mail.com' });
    }
    return user;
  })
  .then(user => {
    return user.createFavorite();
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });