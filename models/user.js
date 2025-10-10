const mongoose = require('mongoose');
const hashPassword = require('../utils/hashpassword');
const comparePassword = require('../utils/comparepassword');

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    password:{type:String,required:true},
},{timestamps:true});

userSchema.pre('save', hashPassword);
userSchema.methods.comparePassword = comparePassword;

const user = mongoose.model('user',userSchema);
module.exports = user;
