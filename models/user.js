const mongoose = require('mongoose');
const crypto = require('crypto');
const hashPassword = require('../utils/hashpassword');
const comparePassword = require('../utils/comparepassword');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    password:{type:String,required:true},
    refreshToken:{type:String},
    
    email:{type:String},
    verifiedEmail:{type:Boolean, default:false},
    emailVerifyToken:{type:String},
    emailVerifyTokenExpiry:{type:Date},

    forgotPassToken:{type:String},
    forgotPassTokenExpiry:{type:Date}

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

userSchema.methods.generateTempToken = function(){
    const unHashedTempToken = crypto.randomBytes(20).toString('hex');

    const hashedTempToken = crypto.createHash('sha256')
        .update(unHashedTempToken)
        .digest('hex')

    const tempTokenExpiry = Date.now() + (20*60*1000);

    return {unHashedTempToken, hashedTempToken, tempTokenExpiry};
}

const user = mongoose.model('users',userSchema);
module.exports = user;
