const express = require('express');
const router = express.Router();
require('dotenv').config();
const jwtauthmiddleware = require('../middlewares/jwtauthmiddleware');
const {
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

} = require('../controllers/user.controllers');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.put('/logout',jwtauthmiddleware, logoutUser);
router.get('/getuser',jwtauthmiddleware, getUser);
router.post('/refreshAccessToken', refreshAccessToken);
router.post('/change-password', jwtauthmiddleware, changePassword);

router.post('/send-email-verification',jwtauthmiddleware,sendEmailVerification);
router.post('/verify-email/:unHashedTempToken',jwtauthmiddleware,verifyEmail);

router.post('/forgot-password-request',forgotPassRequest);
router.post('/reset-forgot-password/:unHashedForgotPassToken',resetForgotPassword)

module.exports = router;