const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    date:{
        type:Date,
    },
   userId:{
    type:String,
    ref:'User'
   },
   products:[{
    product:{
        type:String,
        ref:'Product'
    },
    quantity:{
        type:Number
    },
    totalprice:{
        type:Number
    }
   }],
   subtotal:{
    type:Number
   },
   address:{
    type:String,
    ref:'Address'
    
   },
   paymentmethod:{
    type:String
   },
   orderstatus:{
    type:String
   },
   peymentstatus:{
    type:String
   }
},{timestamps:true});

const Order = mongoose.model('Order',orderSchema)
module.exports = Order;