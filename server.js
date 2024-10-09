const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors');

mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost:27017/testsapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Error...", err);
    process.exit();
  });
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

app.get("/", (req, res) => {
  res.json({ message: "Server is running :D" });
});

let PORT = 8082;

app.listen(PORT, () => {
    require("./App/routes/app.route.js")(app);
  console.log(`Server is listening on port ${PORT}`);
});