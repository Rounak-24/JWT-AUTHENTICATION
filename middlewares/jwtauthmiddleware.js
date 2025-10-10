const jwt = require('jsonwebtoken');
const {addTokentoBlacklist, blacklistHasToken} = require('../utils/blacklist');
require('dotenv').config();
const key = process.env.JWT_SECRET_KEY;

const jwtauthmiddleware = async (req,res,next)=>{
    try{
        const auth = req.headers.authorization;
        if(!auth) return res.status(401).json({error:'Token not found'});

        const token = auth.split(' ')[1];
        if(!token) return res.status(401).json({error:'unauthorized'});

        if(blacklistHasToken(token)) return res.status(401).json({error:'Token invoked'});

        const decoded = await jwt.verify(token,key);
        req.user = decoded;
        next();
    
    }catch(err){
        res.status(401).json({err:'Invalid token'})
    }
}

module.exports = jwtauthmiddleware