require("dotenv/config");
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
const mongoose = require('mongoose');
const db = require('./config/database')

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const cartCount = require('./middleware/count')

const app = express();

//middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());



//view engine
app.set('view engine','ejs');
app.set('views',__dirname+'/views');


app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const key =process.env.SESSIONKEY
app.use(session({
  secret:key,
  resave : false,
  saveUninitialized:true,
  cookie:{maxAge:6000000}
}))


app.use( (req, res, next)=> {
  res.locals.session = req.session;

  next();
});
app.use(cartCount)
//routes
app.use('/admin', adminRouter);
app.use('/', userRouter);
app.use('*',(req, res, next)=> {
  res.status(404).render('user/404');
});


const port = process.env.PORT ;
db.dbConnection((res)=>{
  if(res){
    console.log("mongoose running");
  }else{
    console.log("mongoose error")
  }
})

  app.listen(port,()=>{
    console.log(`server is running at port no${port}`)
  })


