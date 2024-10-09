const mongoose = require("mongoose");
const Joi = require('joi');

const appSchema = mongoose.Schema({
  name:{type:String , require:true , minlength: 3, maxlength: 10},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true,  minlength: 5 },
  number:{type:Number , required:true, maxlength:10, unique:true},
  token:{type:String},
});

module.exports = mongoose.model("App", appSchema);