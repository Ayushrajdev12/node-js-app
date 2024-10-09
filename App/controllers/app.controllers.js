const App = require("../model/app.model.js");
const express = require("express");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

exports.create = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, number } = req.body;

    if (!(email && password && name && number)) {
      res.status(400).send("All input is required");
    }
    const oldUser = await App.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    const hashedPwd = bcrypt.hashSync(password, salt);

    const UserSchema = await new App({
      name,
      email: email.toLowerCase(),
      password: hashedPwd,
      number,
    });

    const token = jwt.sign(
      { UserSchema_id: UserSchema._id, email },
      "secretkey",
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
      }
    );
    UserSchema.token = token;
    UserSchema.save().then((data) => {
      res.send(data);
    });
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await App.findOne({ email, password });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        "secretkey",
        process.env.TOKEN_KEY,
        {
          expiresIn: "4h",
        }
      );

      user.token = token;

      res.status(200).json(user);
    } else {
      res.status(400).send("Invalid  Credentials");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error Occured");
  }
};
const config = process.env;
exports.auth = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    console.log("========dasd=========", token);
    const decoded = await jwt_decode(token, "secretKey", config.TOKEN_KEY);
    console.log("=======decoded", decoded);
    req.user = decoded;
    res.status(200).send("Welcome");
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};
exports.findAll = (req, res) => {
  App.find()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        UserSchema:
          err.UserSchema || "Some error occurred while retrieving messages.",
      });
    });
}
exports.findOne = (req, res) => {
  App.find({ name: req.params.messageId })
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      return res.status(500).send({
        UserSchema: "Error retrieving message with id " + req.params.messageId,
      });
    });
};
exports.update = (req, res) => {
  const hashedPwd = bcrypt.hashSync(req.body.password, salt);

  App.findByIdAndUpdate(
    req.params.messageId,
    {
      name: req.body.name,
      email: req.body.email,
      password: hashedPwd,
      number: req.body.number,
    },
    { new: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          UserSchema: "message not found with id " + req.params.messageId,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          UserSchema: "message not found with id " + req.params.messageId,
        });
      }
      return res.status(500).send({
        UserSchema: "error updating message with id " + req.params.messageId,
      });
    });
};
exports.delete = (req, res) => {
  App.findByIdAndDelete(req.params.messageId)

    .then((data) => {

      if (!data) {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });

      }
      res.send({ UserSchema: "Message deleted successfully!" });
      res.status(204).send("Logged out!")

    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          UserSchema: "Message not found with id " + req.params.messageId,
        });
      }
      return res.status(500).send({
        UserSchema: "Could not delete message with id " + req.params.messageId,
      });
    });
};
