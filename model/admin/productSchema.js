const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    product_name : {
        type : String,
        required:true
    },
    brand :{
        type : String
    },
    colour :{
        type:Array
    },
    price :{
        type :Number
    },
    quantity :{
        type : Number
    },
    catagory :{
        type:String,
    
        required:true,
    },
    image :{
        type :Array,
        required:true
    },
    discription :{
        type :String,
        max :100
    },
    discount :{
        type : String

    },
    size :{
        type: Array
    },
    delete: {
        type: Boolean,
        default: false,
      }
},{timestamps:true});
const Product =mongoose.model("Product", productSchema );
module.exports= Product;