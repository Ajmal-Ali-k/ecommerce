const Cart = require('../model/user/cart')

const cartCount = (req,res,next)=>{
    if(req.session.user){
    const userId = req.session.user._id
    Cart.findOne({owner:userId}).then((data)=>{
        console.log(data,"this i scount");
        const length = data.items.length
        res.locals.count = length

    })
    next()
    }else{
        res.locals.count = 0
        next()
    }


}

module.exports = cartCount;