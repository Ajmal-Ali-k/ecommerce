const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
const mongoose = require('mongoose');

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const User = require ("./model/user/userModel");
const Cart = require('./model/user/cart');
const { findOne } = require('./model/user/order');
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

app.use(session({
  secret:"sessionKey",
  resave : false,
  saveUninitialized:true,
  cookie:{maxAge:6000000}
}))


app.use( (req, res, next)=> {
  res.locals.session = req.session;

  next();
});

//routes
app.use('/admin', adminRouter);
app.use('/', userRouter);
app.use('*',(req, res, next)=> {
  res.status(404).render('user/404');
});

// app.use(adminroutes);






//database connection
const port = process.env.PORT || 2000 ;
 mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/ekka", { useNewUrlParser: true, useUnifiedTopology: true})
  .then((result) => app.listen(port,()=>{
    console.log(`server is running at port no ${port}`);
  }))
  .catch((err) => console.log(err));




