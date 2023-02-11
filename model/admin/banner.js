const mongoose=require("mongoose")

const Banner=new mongoose.Schema({

  image:{
    type:String
  }   ,
  title:{
    type:String
  } ,
  url:{
    type:String
  },
  description:{
    type:String
  },
  subImage:{
    type:String
  }
})
module.exports=mongoose.model("Banner",Banner)