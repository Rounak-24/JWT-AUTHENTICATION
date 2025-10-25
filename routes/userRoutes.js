const express = require('express');
const router = express.Router();
require('dotenv').config();
const jwtauthmiddleware = require('../middlewares/jwtauthmiddleware');
const {signupUser, loginUser, logoutUser, getUser, refreshAccessToken} = require('../controllers/userControllers');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.put('/logout',jwtauthmiddleware, logoutUser);
router.get('/:id/getuser',jwtauthmiddleware, getUser);
router.post('/refreshAccessToken', refreshAccessToken);

module.exports = router;