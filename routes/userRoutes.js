const express = require('express');
const router = express.Router();
require('dotenv').config();
const jwtauthmiddleware = require('../middlewares/jwtauthmiddleware');
const {signupUser, loginUser, logoutUser} = require('../controllers/usercontrollers');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout',jwtauthmiddleware, logoutUser);

module.exports = router;