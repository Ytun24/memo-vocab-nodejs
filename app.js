const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const Sequelize = require("sequelize");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const memberRoutes = require("./routes/member");
const showcaseRoutes = require("./routes/showcase");
const favoriteRoutes = require("./routes/favorite");
const authRoutes = require("./routes/auth");

const sequelize = require("./util/database");
const Vocab = require("./models/vocab");
const User = require("./models/user");
const Favorite = require("./models/favorite");
const FavoriteItem = require("./models/favorite-item");
const Archive = require("./models/archive");
const ArchiveItem = require("./models/archive-item");

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

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
      db: sequelize,
    }),
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => next(new Error(err)));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use("/member", memberRoutes);
app.use("/favorite", favoriteRoutes);
app.use("/showcase", showcaseRoutes);
app.use(authRoutes);

app.use("/", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something went wrong!')
})

Vocab.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Vocab);

User.hasOne(Favorite);
Favorite.belongsTo(User);
Favorite.belongsToMany(Vocab, { through: FavoriteItem });
Vocab.belongsToMany(Favorite, { through: FavoriteItem });

Archive.belongsTo(User);
User.hasMany(Archive);
Archive.belongsToMany(Vocab, { through: ArchiveItem });
Vocab.belongsToMany(Archive, { through: ArchiveItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
