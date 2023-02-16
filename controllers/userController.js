require("dotenv/config");
const User = require("../model/user/userModel");
const Coupon = require("../model/admin/coupon");
const bcrypt = require("bcrypt");
const Product = require("../model/admin/productSchema");
const { response, query } = require("express");
const { default: mongoose } = require("mongoose");
const Cart = require("../model/user/cart");
const Category =require("../model/admin/catagorySchema");
const Address = require("../model/user/address");
const Order = require("../model/user/order");
const Banner = require("../model/admin/banner");
const { findOne } = require("../model/user/order");
const paypal = require("@paypal/checkout-server-sdk");
const { sendotp, varifyotp } = require("../helpers/otp");
const envirolment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalCliend = new paypal.core.PayPalHttpClient(
  new envirolment(process.env.PAYPAL_CLIND_ID, process.env.SECRET_KEY)
);
let userDetail;

const index_get = async (req, res) => {
  const view = await Product.find().limit(8);
  const banner = await Banner.find({});
  const kids= await Product.find({catagory:"kids"}).limit(8)
  const women = await Product.find({catagory:"women"}).limit(8)
  const men = await Product.find({catagory:"men"}).limit(8)
  res.render("user/index", { banner,view,kids,women,men });
};
const userLogin_get = (req, res) => {
  res.render("user/login");
};

const signup_get = (req, res) => {
  res.render("user/signup");
};
const catagory = async(req, res) => {
  console.log("hhhhhjjjjjjjjjj")
  const id = req.query.id;
  let category;
  let product;
  if(id){
     product = await Product.find({catagory:id});
     category = await Category.find({});
    console.log(category,"this is category")
    console.log(product, "this is product")
  }else{
    product = await Product.find({})
     category = await Category.find({}); 
  }
  res.render("user/catagory",{ category, product });
 
};
const productspage = async (req, res) => {
  const view = await Product.find({delete:false});
  res.render("user/products", { view });
};


const otp = (req, res) => {
  const phone = userDetail.phone
  console.log(phone);
  res.render("user/otp",{phone});
};
const wishlist = (req, res) => {
  res.render("user/wishlist");
};

let logout = (req, res) => {
  req.session.loggedin = null;
  req.session.user= null
  res.redirect("/");
};

// user signup
const signup_post = async (req, res) => {
  const userCheck = await User.findOne({ email: req.body.email });
  if (userCheck) {
    console.log("email already in");
    res.redirect("/signup");
  } else {
    if (req.body.password == req.body.Confirmpassword) {
      const bcryptpass = await bcrypt.hash(req.body.password, 10);
      const registerUser = await User.create(
        {
          Name: req.body.name,
          email: req.body.email,
          phoneNo: req.body.phone,
          password: bcryptpass,
        },
        (err) => {
          if (err) console.log(err);
        }
      );
      res.render("user/login");
    } else {
      console.log(err);
      res.redirect("/signup");
    }
  }
};

//user login
const userLogin_post = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(email, password);

  const user = await User.findOne({ email: email });
  if (user) {
    await bcrypt.compare(password, user.password, (err, data) => {
      if (err) {
        console.log(err);
      } else if (data == true) {
        console.log("user login succesful");
        req.session.loggedin = true;
        req.session.user = user;
        res.redirect("/");
      } else {
        console.log("wrong password");
        res.redirect("/login");
      }
    });
  }
};

/********preview page******************/

let previewPage = async (req, res) => {
  let findedpro;
  const id = req.query.id;
  try {
    findedpro = await Product.findOne({ _id: id });
    if (findedpro) {
      req.session.temp = findedpro._id;
    } else {
      temp = req.session.temp;
      findedpro = await Product.findOne({ _id: temp });
    }
    await res.render("user/preview", { findedpro });
  } catch (error) {
    findedpro = req.session.temp;
    res.redirect("/previewpage?id=req.query.id");
  }
};

//--------------------------cart----------------------------//

const getCart = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const cartItems = await Cart.findOne({
      owner: mongoose.Types.ObjectId(userId),
    }).populate("items.product");
    res.render("user/cart", { cartItems, userId });
  } catch (error) {
    console.log(error);
  }
};

const addTocart = async (req, res) => {
  try {
    console.log("hiiiiiiiiiiiiiiii");

    const prodId = req.params.id;
    const userId = req.session.user._id;
    console.log(userId);
    const product = await Product.findOne({ _id: prodId });

    const user = await Cart.findOne({ owner: userId });
    const count = user.items.length;
    req.session.count = count;
    if (product.quantity < 1) {
    } else {
      if (!user) {
        const newCart = await Cart({
          owner: userId,
          items: [{ product: prodId, totalprice: product.price }],
          cartTotal: product.price,
        });
        await newCart.save();
      } else {
        const productcheck = await Cart.findOne({
          owner: userId,
          "items.product": prodId,
        });

        if (productcheck !== null) {
          await Cart.findOneAndUpdate(
            {
              owner: userId,
              "items.product": prodId,
            },
            {
              $inc: {
                "items.$.quantity": 1,
                "items.$.totalprice": product.price,
                cartTotal: product.price,
              },
            }
          );
        } else {
          const newproAdd = await Cart.findOneAndUpdate(
            { owner: userId },
            {
              $push: {
                items: { product: prodId, totalprice: product.price },
              },
              $inc: {
                cartTotal: product.price,
              },
            }
          );
        }
        res.json({ cart: true });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// items remove from cart

const removeCart = async (req, res) => {
  try {
    console.log("removeooooooooooooooooooooooooooooo");
    let userdata = req.session.user;
    const prodId = req.params.id;
    let products = await Product.findOne({ _id: prodId });
    let carts = await Cart.findOne({ owner: userdata });

    let index = carts.items.findIndex((el) => {
      return el.product == prodId;
    });
    let price = carts.items[index].totalprice;
    let deletingProduct = await Cart.findOneAndUpdate(
      { owner: userdata._id },
      {
        $pull: {
          items: { product: prodId },
        },
        $inc: { cartTotal: -price },
      }
    );
    res.json({
      totalprice: carts.cartTotal,
    });
  } catch (error) {
    console.log(error);
  }
};

// cart quantity

const cartQuantity = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const prod = req.query.productID;
    const product = await Product.findById(prod);
    if (req.query.number == 1) {
      const cart = await Cart.findOneAndUpdate(
        { owner: userId, "items.product": req.query.productID },
        {
          $inc: {
            "items.$.quantity": 1,
            "items.$.totalprice": product.price,
            cartTotal: product.price,
          },
        },
        { new: true }
      );
      console.log(cart);
      let index = cart.items.findIndex((x) => x.product == req.query.productID);

      res.json({
        price: cart.items[index].totalprice,
        quantity: cart.items[index].quantity,
        totalprice: cart.cartTotal,
      });
    } else if (req.query.number == -1) {
      const cart = await Cart.findOneAndUpdate(
        { owner: userId, "items.product": req.query.productID },
        {
          $inc: {
            "items.$.quantity": -1,
            "items.$.totalprice": -product.price,
            cartTotal: -product.price,
          },
        },
        { new: true }
      );
      let index = cart.items.findIndex((x) => x.product == req.query.productID);

      if (cart.items[index].quantity <= 0) {
        res.json({
          quantity: null,
        });
      } else {
        res.json({
          price: cart.items[index].totalprice,
          totalprice: cart.cartTotal,
          quantity: cart.items[index].quantity,
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

/******************profile *************************/

const userprofile = async (req, res) => {
  const user = req.session.user;
  const userId = req.session.user._id;

  const useraddress = await Address.findOne({ user: userId });
  if (useraddress) {
    const findaddress = useraddress.address;
    res.render("user/userprofile", { user, findaddress, useraddress });
  } else {
    res.render("user/userprofile", { user, useraddress });
  }
};

// address

const addAddres = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const { name, phone, state, city, address, pin } = req.body;
    console.log(req.body);
    const existAddress = await Address.findOne({ user: userId });

    if (existAddress) {
      const addAddress = await Address.findOneAndUpdate(
        { user: userId },
        {
          $push: {
            address: {
              name,
              phone,
              state,
              city,
              address,
              pin,
            },
          },
        }
      );
      res.json({ status: true });
    } else {
      const addnewAddress = await Address.create({
        address: {
          name,
          phone,
          state,
          city,
          address,
          pin,
        },
        user: userId,
      });
      res.json({
        status: true,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const deleteAddress = async (req, res) => {
  const addressid = req.params.id;
  const userId = req.session.user;
  console.log(addressid, "this is address", userId, "this is user");
  const address = await Address.updateOne(
    { user: userId },
    { $pull: { address: { _id: addressid } } }
  );
  res.redirect("/profile");
};

//************checkout*******************//

const checkout = async (req, res) => {
  const userId = req.session.user._id;

  const addresses = await Address.findOne({ user: userId });
  console.log(addresses);
  const usercart = await Cart.findOne({ owner: userId }).populate(
    "items.product"
  );
  const paypalclientid = process.env.PAYPAL_CLIND_ID;
  console.log(paypalclientid);

  res.render("user/checkout", { addresses, usercart, paypalclientid, userId });
};

const placeOrder = async (req, res) => {
  const addressid = req.body.address;
  const ordertype = req.body.paymode;
  const Amount = req.body.total;
  let discount = req.body.discount;
  if (!discount) {
    discount = "0";
  }
  console.log(discount, "ggggggggg");
  console.log(req.body.total);

  console.log(addressid, ordertype, Amount, "----------------------");

  const userId = req.session.user._id;
  const ordercart = await Cart.findOne({ owner: userId });

  const address = await Address.findOne({ user: userId });

  console.log("this is address", Address);

  const DeliveryAddress = address.address.find(
    (el) => el._id.toString() == addressid
  );
  console.log(DeliveryAddress._id, "this is delivery address");
  if (ordertype === "cod") {
    const neworder = new Order({
      date: new Date(),
      userId: ordercart.owner,
      products: ordercart.items,
      subtotal: Amount,
      discount: discount,
      address: DeliveryAddress._id,
      paymentmethod: ordertype,
      orderstatus: "processing",
      peymentstatus: "unpaid",
    });
    neworder.save().then((result) => {
      req.session.orderId = result._id;
      const orderedproducts = result.products;
      orderedproducts.forEach(async (element) => {
        let remove = await Product.findByIdAndUpdate(
          { _id: element.product },
          { $inc: { quantity: -element.quantity } }
        );
      });
      console.log("removed product");
      ordercart.items = [];
      ordercart.cartTotal = 0;
      ordercart.save();

      res.json({ cod: true });
    });
  } else if (ordertype === "paypal") {
    console.log("paypalllllllll");

    const neworder = new Order({
      date: new Date(),
      userId: ordercart.owner,
      products: ordercart.items,
      subtotal: Amount,
      discount: discount,
      address: DeliveryAddress._id,
      paymentmethod: ordertype,
      orderstatus: "processing",
      peymentstatus: "pending",
    });
    await neworder.save().then((result) => {
      req.session.orderId = result._id;
      let userOrderdata = result;
      res.json({
        paypal: true,
        walletBalance: Amount,
        userOrderData: userOrderdata,
      });
    });
  }
};

const orderSuccess = async (req, res) => {
  console.log("successs.");
  const userId = req.session.orderId;

  const order = await Order.findOne({ _id: userId }).populate(
    "products.product"
  );
  const OrderedAddress = order.address;
  const address = await Address.findOne({ user: order.userId });
  const index = address.address.findIndex((obj) => obj._id == OrderedAddress);
  const finalAddress = address.address[index];

  console.log(finalAddress, order);
  res.render("user/success", { finalAddress, order });
};

const createOrder = async (req, res) => {
  console.log("paypal=");
  console.log(paypalCliend);
  const request = new paypal.orders.OrdersCreateRequest();

  const balance = req.body.items[0].amount;

  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: balance,

          breakdown: {
            item_total: {
              currency_code: "USD",
              value: balance,
            },
          },
        },
      },
    ],
  });
  try {
    console.log("pay --------------------------------------");

    const order = await paypalCliend.execute(request);

    console.log(order, "sdfgtrrrrrrrrrrrrrrrrrrrrr");
    res.json({ id: order.result.id });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

// const varifypayment = async (req, res) => {
//   console.log("verifyyyyyyyyyyyy");
//   const orderedproducts = result.products
//   orderedproducts.forEach(async(element) =>{
//     let remove = await Product.findByIdAndUpdate(
//       {_id:element.product},
//       {$inc:{quantity :-element.quantity}}
//     )
//   });

//   const userId = req.session.user._id;
//   const ordercart = await Cart.findOne({ owner: userId });
//   ordercart.items = [];
//   ordercart.cartTotal = 0;
//   ordercart.save();

//   res.json({ status: true });
// };
const varifypayment = async (req, res) => {
  console.log("payment verification");
  try {
    const orderUpdate = await Order.findOneAndUpdate(
      { _id: req.session.orderId },
      { $set: { peymentstatus: "confirmed", orderstatus: "processing" } }
    );
    const orderedproducts = orderUpdate.products;
    orderedproducts.forEach(async (element) => {
      await Product.findByIdAndUpdate(
        { _id: element.product },
        { $inc: { quantity: -element.quantity } }
      );
    });
    console.log("product removed  bbbbbbbbb");
    const userId = req.session.user._id;
    const ordercart = await Cart.findOne({ owner: userId });
    ordercart.items = [];
    ordercart.cartTotal = 0;
    ordercart.save();

    res.json({ status: true });
  } catch (error) {
    console.log(error);
  }
};

const orderHistory = async (req, res) => {
  const userId = req.session.user._id;
  const orders = await Order.find({ userId: userId })
    .populate("products.product")
    .sort({ date: -1 });
  console.log(orders);
  res.render("user/history", { orders });
};
const orderDetails = async (req, res) => {
  const orderId = req.query.orderId;
  console.log("hiii", orderId);
  const order = await Order.findOne({ _id: orderId }).populate(
    "products.product"
  );
  const OrderedAddress = order.address;
  const address = await Address.findOne({ user: order.userId });
  const index = address.address.findIndex((obj) => obj._id == OrderedAddress);
  const finalAddress = address.address[index];

  res.render("user/orderdetails", { order, finalAddress });
};

const couponcheck = async (req, res) => {
  console.log("hiiiiiiiiiiiiii");

  try {
    console.log("jiiiiiiiiiii");
    let userId = req.body.user;
    const total = parseInt(req.body.carttotal);
    const coupon = await Coupon.findOne({ couponcode: req.body.couponcode });

    const usedcoupen = await Coupon.findOne({
      couponcode: req.body.couponcode,
      userUsed: req.session.user,
    });
    console.log(usedcoupen, coupon);

    if (usedcoupen) {
      console.log("used coupon");
      res.json({ status: false, message: "INVALID COUPON" });
    } else {
      if (coupon && coupon.mincartAmount <= total) {
        const currrentDate = new Date();
        const endDate = coupon.expireDate;
        if (currrentDate <= endDate) {
          console.log("coupon date checking");
          const couponCheck = await Coupon.updateOne(
            { _id: coupon._id },
            { $push: { userUsed: req.session.user } }
          );

          console.log("coupon checked");
          const discount = parseInt(coupon.discountAmount);
          const totalprize = total - discount;
          console.log(totalprize);
          res.json({ status: true, totalprize, discount });
          console.log("valid coupon");
        } else {
          res.json({ status: false, message: "INVALID COUPON" });
        }
      } else {
        res.json({ status: false, message: "INVALID COUPON" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const ID = req.body.ID;
    console.log(ID);
    const order = await Order.findByIdAndUpdate(req.body.ID, {
      orderstatus: "Cancelled",
    });
    orderProduct = order.products;
    orderProduct.forEach(async (element) => {
      let update = await Product.findByIdAndUpdate(element.Product, {
        $inc: { quantity: element.quantity },
      });
    });
    res.json({ status: true });
  } catch (err) {
    console.log(err);
  }
};

const otpverify = async (req, res, next) => {
  userDetail = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
  };
  console.log(userDetail, "this is user details");
  try {
    let response = null;
    if (req.session.user) {
      res.redirect("/login");
    } else {
      userDetail = req.body;
      if (await User.findOne({ email: userDetail.email })) {
        response = " this email already exist";
        console.log("this email is alreay exist");
      } else if (await User.findOne({ phoneNo: userDetail.phone })) {
        response = "this number is already exist";
        console.log("this number is already exist");
      } else {
        userDetail = req.body;
        console.log("otpsending");
        sendotp(userDetail.phone);
        response = null;
      }
    }
    res.json({ response });
  } catch (error) {
    next(error);
  }
};

const otpVerifyPost = async (req,res) =>{
  const password = userDetail.password
  const phone = userDetail.phone
  const otp = req.query.otp
  console.log('hiiiiiiiiiiiii',otp)
  await varifyotp(phone,otp).then(async(verification_check)=>{
    if(verification_check.status=="approved"){
      const hashedpassword = await bcrypt.hash(password,10)
      await User.create({
        Name: userDetail.name,
        email: userDetail.email,
        phoneNo: userDetail.phone,
        password: hashedpassword,
      })
      .then((e)=>{
        res.json({response:true})
      })
    }else{
      res.json({response:false})
    }
  }) 
}

const forgotPassword = async (req,res)=>{
  res.render('user/forgot_password')
}


const forgotpost = async (req,res)=>{
  console.log("jiiiiiiiiiiiiii");
  let response =null;
  console.log(req.body.email)
  let findUser = await User.findOne({ email: req.body.email},{_id:0,phoneNo:1}).then((user)=>{
    console.log(user,111  )
    if(user){
         sendotp(user.phoneNo);
        res.json({mobile:user.phoneNo ,status:true})
    }else{
      res.json({response:"email not found"});
    }
  })
}

const forgotOtpVerify = async (req, res) => {
  try {
    let {otp, mobile} = req.body;
    console.log(otp, mobile);
    await varifyotp(mobile, otp).then((response) => {
      console.log("waiting for verification");
      if(response){
        console.log("verification approved");
        res.json({response:true})
      }else{
        res.json({response:false})
      }
    })
  } catch (error) {
  console.log(error)    
  }
}
const changePassword = async(req,res,next)=>{
  try {
    let {password,email} = req.body;
    console.log(req.body,"this is req body")
    password = await bcrypt.hash(password,10);
    User.updateOne({email: email},{$set: {password:password}}).then((e)=>{
      res.json({status:true})
      console.log("password updated")
    })
  } catch (error) {
    console.log(error)
    next(error)
    
  }

}
module.exports = {
  index_get,
  userLogin_get,
  userLogin_post,
  signup_get,
  signup_post,
  catagory,
  productspage,
  userprofile,
  otp,
  previewPage,
  wishlist,
  getCart,
  logout,
  addTocart,
  removeCart,
  cartQuantity,
  checkout,
  addAddres,
  orderSuccess,
  placeOrder,
  orderHistory,
  varifypayment,
  createOrder,
  orderDetails,
  deleteAddress,
  couponcheck,
  cancelOrder,
  otpverify,
  otpVerifyPost,
  forgotPassword,
  forgotpost,
  forgotOtpVerify,
  changePassword
};
