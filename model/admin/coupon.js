const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponcode : {
        type : String,
        require:true,
        unique : true
    },
     expireDate:{
        type:Date
    },
    available:{
        type : Number
    },

    status:{
        type:String,
        default:"active"
    },
    usageLimit:{
        type:Number
    },
    mincartAmount:{
        type: Number
    },

    discountAmount:{
        type:Number
    },
    userUsed:[{
        userId:{
            type:String,
            ref:'User'
        }
    }]
},{timestamps:true})

const Coupon = mongoose.model('Coupon',couponSchema)
module.exports = Coupon;