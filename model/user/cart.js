const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    items:[{
        product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
        },
        quantity:{
         type:Number,
         default:1
        },
        totalprice:{
            type:Number,
            default:0
        },
   
    }],
   

    cartTotal:{
        type:Number,
        default:0
    }
},{timestamps:true})
const Cart = mongoose.model('Cart',cartSchema)

module.exports =Cart;