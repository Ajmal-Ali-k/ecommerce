const moongoose = require('mongoose')
const addresSchema = new moongoose.Schema({
    user :{
        type: moongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    address : [{
        name:{
            type:String,
            max:20
        },
        phone:{
            type:Number
        },
        state:{
            type:String
        },
        city:{
            type:String
        },
        address:{
            type:String
        },
        pin:{
            type:Number
        }
    }]
})

const Address = moongoose.model('Address',addresSchema)
module.exports = Address