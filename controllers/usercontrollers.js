require('dotenv').config();
const user = require('../models/user');

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
        const findUser = await user.findById(req.params.id);
        return res.status(200).json({findUser});
    }catch(err){
        res.status(500).json({err:'Internal Server error'});
    }
}

module.exports = {
    signupUser, 
    loginUser, 
    logoutUser,
    getUser
};





// const logoutUser = async (req,res)=>{
//     try{
//         const authHeader = req.headers.authorization;
//         const token = authHeader.split(' ')[1];

//         if(!token) return res.status(401).json({error:'No token'});

//         const decoded = jwt.verify(token,key);

//         let ttlMs = 0;
//         if(decoded && decoded.exp){
//             ttlMs = (decoded.exp*1000) - Date.now();
//             if(ttlMs<0) ttlMs = 0;
//         }

//         addTokentoBlacklist(token,ttlMs);
//         res.clearCookie('token');

//         res.status(200).json({message:'Logged out Successfully'});

//     }catch(err){
//         console.log(err);
//         res.status(500).json({err:'Internal Server Error'})
//     }
// }