const mongoose = require('mongoose');
const port = process.env.DB_URL;

mongoose.connect(port,{
    useUnifiedTopology : true,
    useNewUrlParser: true
})

const db = mongoose.connection;

db.on('connected',()=>{
    console.log('Connected to mongoDB server');
})

db.on('error',(err)=>{
    console.log('Error for mongoDB connection',err);
})
db.on('disconnected',()=>{
    console.log('Disconnected to mongoDB server');
})

module.exports = db;