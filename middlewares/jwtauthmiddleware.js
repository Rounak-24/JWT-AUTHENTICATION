const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtauthmiddleware = async (req,res,next)=>{
    try{
        const auth = req.headers.authorization || req.cookies?.accessToken;
        if(!auth) return res.status(401).json({error:'Token not found'});

        const token = auth.split(' ')[1];
        if(!token) return res.status(401).json({error:'unauthorized'});

        const decoded = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    
    }catch(err){
        console.log(err);
        res.status(401).json({err:'Invalid token'})
    }
}

module.exports = jwtauthmiddleware