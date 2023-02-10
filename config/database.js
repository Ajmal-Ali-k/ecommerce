require("dotenv/config");
const mongoose = require('mongoose');




const url =process.env.DATABASE_URL

mongoose.set('strictQuery', false);
module.exports.dbConnection=function (cb){
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
        cb(true)
    }).catch((err)=>{
        console.log(err);
        cb(false)
    })
    
}
 