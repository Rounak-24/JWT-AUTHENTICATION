const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const key = process.env.JWT_SECRET_KEY;
const user = require('../models/user');
const jwtauthmiddleware = require('../middlewares/jwtauthmiddleware');
const genrateToken = require('../utils/generatetoken');
const {addTokentoBlacklist, blacklistHasToken} = require('../utils/blacklist');


router.post('/signup', async (req,res)=>{
    try{
        const datafromClient = req.body;
        const userName = datafromClient.name;

        const finduser = await user.findOne({name:userName});
        if(finduser){
            res.status(200).json({response:'User already registered'});
            return;
        }

        const newuser = new user(datafromClient);
        const saveuser = await newuser.save();

        const payload = {
            id:saveuser._id,
            username:saveuser.name
        }

        const token = genrateToken(payload);
        res.cookie('auth_token', token ,{
            httpOnly:true,
            secure:true,
            sameSite:'strict',
            maxAge:3600*24*10
        })
        
        res.status(200).json({response:saveuser});
    }catch(err){
        res.status(500).json({error:'Internal Server error'});
    }
})

router.post('/login', async (req,res)=>{
    try{
        const {username,password} = req.body;
        const finduser = await shop.findOne({name:username});

        if(!finduser) return res.status(401).json({error:'Invalid username or password'});

        const correctPassword = await findshop.comparePassword(password);

        if(!correctPassword) return res.status(401).json({error:'Invalid username or password'});

        const payload = {
            id:finduser._id,
            username:finduser.name
        }

        const token = genrateToken(payload);
        res.cookie('auth_token', token ,{
            httpOnly:true,
            secure:true,
            sameSite:'strict',
            maxAge:3600*24*10
        })

        res.status(200).json({message:'Login is successful', payload:payload});

    }catch(err){
        console.log(err)
        res.status(500).json({err:'Internal Server error'});
    }
})

router.post('/logout',jwtauthmiddleware, async (req,res)=>{
    try{
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        if(!token) return res.status(401).json({error:'No token'});

        const decoded = jwt.verify(token,key);

        let ttlMs = 0;
        if(decoded && decoded.exp){
            ttlMs = (decoded.exp*1000) - Date.now();
            if(ttlMs<0) ttlMs = 0;
        }

        addTokentoBlacklist(token,ttlMs);
        res.clearCookie('token');

        res.status(200).json({message:'Logged out Successfully'});

    }catch(err){
        console.log(err);
        res.status(500).json({err:'Internal Server Error'})
    }
})

module.exports = router;