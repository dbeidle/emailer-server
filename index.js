const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
require("./models/user");
require("./services/passport");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const app = express();

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  console.log("Hit root");
  res.status(200).json({ Message: process.env.WELCOME_MESSAGE });
});

// API Routes
require("./routes/authRoutes")(app);

if (process.env.NODE_ENV === "production") {
  // If routes do not match the API, look to the client/build directory
  app.use(express.static("client/build"));
  // If file not in client/build directory, serve index.html
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 3050;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
