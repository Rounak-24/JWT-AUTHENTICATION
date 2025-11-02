const user = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const {
    userVerficationContent,
    resetPasswordContent,
    sendEmail

} = require('../utils/mail');

const signupUser = async (req,res)=>{
    try{
        const finduser = await user.findOne({name:req.body.name});
        if(finduser){
            return res.status(200).json({response:'User already registered'});
        }

        const newuser = new user(req.body);
        const saveuser = await newuser.save();

        const refreshToken = await saveuser.generateRefreshToken();
        saveuser.refreshToken = refreshToken; 

        const accessToken = await saveuser.generateAccessToken();
        await saveuser.save();

        const cookieOptions = {
            httpOnly:true,
            secure:true,
        }

        res.status(200).cookie('accessToken',accessToken, cookieOptions).
        cookie('refreshToken',refreshToken, cookieOptions).json({
            response: saveuser.name, accessToken, refreshToken
        })

    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server error'});
    }
};

const loginUser = async (req,res)=>{
    try{
        const {username,password} = req.body;
        const finduser = await user.findOne({name:username});

        if(!finduser) return res.status(401).json({error:'Invalid username or password'});
        
        const correctPassword = await finduser.comparePassword(password);
        if(!correctPassword) return res.status(401).json({error:'Invalid username or password'});

        const refreshToken = await finduser.generateRefreshToken();
        finduser.refreshToken = refreshToken; 

        const accessToken = await finduser.generateAccessToken();
        await finduser.save();

        const cookieOptions = {
            httpOnly:true,
            secure:true,
        }

        res.status(200).cookie('accessToken',accessToken, cookieOptions).
        cookie('refreshToken',refreshToken, cookieOptions).json({
            response: finduser.name, accessToken, refreshToken,
        })

    }catch(err){
        res.status(500).json({err:'Internal Server error'});
    }
}

const logoutUser = async (req,res)=>{
    try{
        await user.findByIdAndUpdate(
            req.body.user._id,
            {
                $unset:{refreshToken:1}
            },
            {
                new:true,
                runValidators:true
            }
        )

        const cookieOptions = {
            httpOnly:true,
            secure:true,
        }

        res.status(200).clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({message:'User logged out'})

    }catch(err){
        res.status(500).json({err:'Internal Server error'});
    }
}

const getUser = async (req,res)=>{
    try{
        const findUser = await user.findById(req.user?._id);
        return res.status(200).json({findUser});
    }catch(err){
        res.status(500).json({err:'Internal Server error'});
    }
}

const refreshAccessToken = async (req,res)=>{
    try{
        const incommingRefreshToken = req.body.refreshToken || res.cookies?.refreshToken || 
        (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.headers.authorization);

        if(!incommingRefreshToken){
            return res.status(402).json({err:'unauthorized'});
        }

        const decoded = await jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const findUser = await user.findById(decoded?._id);

        if(!findUser || findUser.refreshToken!==incommingRefreshToken){
            return res.status(404).json({error:'User not found'});
        } 

        const newRefreshToken = findUser.generateRefreshToken();
        const newAccessToken = findUser.generateAccessToken();

        findUser.refreshToken = newRefreshToken;
        await findUser.save({
            validateBeforeSave: false
        });

        const cookieOptions = {
            httpOnly:true,
            secure:true
        }

        res.status(200).
        cookie('accessToken',newAccessToken, cookieOptions).
        cookie('refreshToken',newRefreshToken, cookieOptions).
        json({
            newAccessToken,
            newRefreshToken,
            message:'accessToken is refreshed'
        })

    }catch(err){
        res.status(500).json({err:'Internal Server error'});
    }
}

const changePassword = async(req,res)=>{
    try{
        const {oldPassword, newPassword, confirmPassword} = req.body;

        if(!oldPassword || !newPassword || !confirmPassword) return res.status(400).json({error:'all fields are required'});

        const findUser = await user.findById(req.user?._id);
        if(!findUser) res.status(404).json({error:'user not found'});

        if(!await findUser.comparePassword(oldPassword)){
            return res.status(400).json({error:'Incorrect current password'});
        }

        if(newPassword!==confirmPassword) return res.status(400).json({error:'confirm password accurately'});

        findUser.password = newPassword;
        await findUser.save();

        res.status(200).json({message: 'password changed successfully'});

    }catch(err){
        res.status(500).json({err:'Internal Server error'});
    }
}

const sendEmailVerification = async (req,res)=>{
    try{
        const findUser = await user.findById(req.user?._id);
        if(!findUser) return res.status(404).json({error:'user not found'});
        
        const {unHashedTempToken, hashedTempToken, tempTokenExpiry} = findUser.generateTempToken();

        findUser.emailVerifyToken = hashedTempToken;
        findUser.emailVerifyTokenExpiry = tempTokenExpiry;

        await findUser.save();

        await sendEmail({
            email:findUser?.email,
            subject:'Please verify your email',
            mailgenContent:userVerficationContent(findUser?.name,
                `${req.protocol}://${req.get('host')}user/verify-email/${unHashedTempToken}`
            )
        })
        
        res.status(200).json({message: 'Email sent successfully'});

    }catch(err){
        res.status(500).json({err:'Server error while sending verification mail'});
    }
}

const verifyEmail = async (req,res)=>{
    try{
        const {unHashedTempToken} = req.params;
        if(!unHashedTempToken) return res.status(404).json({error:'Verification token not found'});

        const hashedToken = crypto
            .createHash('sha256')
            .update(unHashedTempToken)
            .digest('hex')

        const findUser = await user.findOne({
            emailVerifyToken:hashedToken,
            emailVerifyTokenExpiry:{$gt: Date.now()}
        })

        if(!findUser) return res.status(404).json({error:'Verification token is invalid or expired'}); 
        
        findUser.verifiedEmail = true;
        findUser.emailVerifyToken = undefined;
        findUser.emailVerifyTokenExpiry = undefined;

        await findUser.save();
        
        res.status(200).json({message:'Email verified successfully'});

    }catch(err){
        res.status(500).json({err:'Server error while email verification'});
    }
}

const forgotPassRequest = async (req,res)=>{
    try{
        const {email} = req.body;

        const findUser = await user.findOne({email:email});
        if(!findUser) return res.status(404).json({error:'user not found'});

        const {unHashedTempToken, hashedTempToken, tempTokenExpiry} = findUser.generateTempToken();

        findUser.forgotPassToken = hashedTempToken;
        findUser.forgotPassTokenExpiry = tempTokenExpiry;

        await findUser.save();

        await sendEmail({
            email:findUser?.email,
            subject:'Reset your Password',
            mailgenContent:resetPasswordContent(findUser?.name,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedTempToken}`
            )
        }) 
        
        res.status(200).json({message: ' Forgot password mail sent successfully'});

    }catch(err){
        res.status(500).json({err:'Server error while sending forgot password mail'});
    }
}

const resetForgotPassword = async (req,res)=>{
    try{
        const {newPassword} = req.body;
        const {unHashedForgotPassToken} = req.params;

        const hashedToken = crypto
            .createHash('sha256')
            .update(unHashedForgotPassToken)
            .digest('hex')

        const findUser = await user.findOne({
            forgotPassToken:hashedToken,
            forgotPassTokenExpiry:{$gt: Date.now()}
        })

        if(!findUser) return res.status(404).json({error:'Forgot pass token is invalid or expired'});

        findUser.password = newPassword;
        findUser.forgotPassToken = undefined;
        findUser.forgotPassTokenExpiry = undefined;

        await findUser.save();
        
        res.status(200).json({message:'password has been changed successfully'});

    }catch(err){
        res.status(500).json({err:'Server error while reseting password'});
    }
}

module.exports = {
    signupUser, 
    loginUser, 
    logoutUser,
    getUser,
    refreshAccessToken,
    changePassword,
    sendEmailVerification,
    verifyEmail,
    forgotPassRequest,
    resetForgotPassword
};