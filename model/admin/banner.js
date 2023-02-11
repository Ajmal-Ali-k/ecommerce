const mongoose=require("mongoose")

const Banner=new mongoose.Schema({

  image:{
    type:String,
    required:true
  }   ,
  title:{
    type:String
  } ,
  url:{
    type:String
  },
  discription:{
    type:String
  }
  
})
module.exports=mongoose.model("Banner",Banner)