const express = require('express');
const router = express.Router();
require('dotenv').config();
const jwtauthmiddleware = require('../middlewares/jwtauthmiddleware');
const {signupUser, 
    loginUser, 
    logoutUser, 
    getUser, 
    refreshAccessToken,
    changePassword
} = require('../controllers/user.controllers');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.put('/logout',jwtauthmiddleware, logoutUser);
router.get('/getuser',jwtauthmiddleware, getUser);
router.post('/refreshAccessToken', refreshAccessToken);
router.post('/change-password', jwtauthmiddleware, changePassword);

module.exports = router;