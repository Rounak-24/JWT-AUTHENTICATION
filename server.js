const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.port;
const db = require('./config/db');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const logRequest = (req,res,next)=>{
    console.log(`${new Date().toLocaleString()} request made to : ${req.originalUrl}`);
    next();
}
app.use(logRequest);

app.get('/',(req,res)=>{
    res.send('Server is live');
})

const userRoutes = require('./routes/userRoutes');
app.use('/user',userRoutes);

app.listen(port,()=>{
    console.log(`Example app listening on ${port}`);
})