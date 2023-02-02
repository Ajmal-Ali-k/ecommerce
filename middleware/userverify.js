const verifyUser = (req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/login')
    }
}


const verifyLogin = (req,res,next)=>{
    if(req.session.user){
        next()
    }else{
       
        res.json({status:false})
    }
}



module.exports={verifyUser,verifyLogin}