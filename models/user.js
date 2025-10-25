const mongoose = require('mongoose');
const hashPassword = require('../utils/hashpassword');
const comparePassword = require('../utils/comparepassword');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    password:{type:String,required:true},
    refreshToken:{type:String}
},{timestamps:true});

userSchema.pre('save', hashPassword);
userSchema.methods.comparePassword = comparePassword;

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const user = mongoose.model('users',userSchema);
module.exports = user;
