require("dotenv/config");
const User = require("../model/user/userModel");
const Coupon = require("../model/admin/coupon");
const bcrypt = require("bcrypt");
const Product = require("../model/admin/productSchema");
const { response, query } = require("express");
const { default: mongoose } = require("mongoose");
const Cart = require("../model/user/cart");
const Address = require("../model/user/address");
const Order = require("../model/user/order");
const { findOne } = require("../model/user/order");
const paypal = require("@paypal/checkout-server-sdk");
const envirolment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalCliend = new paypal.core.PayPalHttpClient(
  new envirolment(process.env.PAYPAL_CLIND_ID, process.env.SECRET_KEY)
);

const index_get = (req, res) => {
  res.render("user/index");
};
const userLogin_get = (req, res) => {
  res.render("user/login");
};

const signup_get = (req, res) => {
  res.render("user/signup");
};
const catagory = (req, res) => {
  res.render("user/catagory");
};
const productspage = async (req, res) => {
  const view = await Product.find();
  res.render("user/products", { view });
};

const phone = (req, res) => {
  res.render("user/phone");
};
const otp = (req, res) => {
  res.render("user/otp");
};
const wishlist = (req, res) => {
  res.render("user/wishlist");
};

let logout = (req, res) => {
  req.session.user = null;
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

// let previewPage = async (req, res) => {
//   const id = req.query.id;

//   const findedpro = await Product.findOne({ _id: id });
//   res.render("user/preview", { findedpro });
// };
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
const inventory = (productId, qntity) => {
  return new Promise((resolve, reject) => {
      productModel.findOneAndUpdate({ _id: productId }, { $inc: { quantity: -qntity } }).then(() => {
          resolve();
      });
  });
};

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
  const discount = req.body.discount;
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
      orderstatus: "pending",
      peymentstatus: "unpaid",
    });
    neworder.save().then((result) => {
      req.session.orderId = result._id;
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
      orderstatus: "pending",
      peymentstatus: "accepted",
    });
    await neworder.save().then((result) => {
      req.session.orderId = result._id;

      console.log(result.totalprice, "hiiiiiiiiiiiiiiiiiii");

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

const varifypayment = async (req, res) => {
  console.log("verifyyyyyyyyyyyy");

  const userId = req.session.user._id;
  const ordercart = await Cart.findOne({ owner: userId });
  ordercart.items = [];
  ordercart.cartTotal = 0;
  ordercart.save();

  res.json({ status: true });
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

module.exports = {
  index_get,
  userLogin_get,
  userLogin_post,
  signup_get,
  signup_post,
  catagory,
  productspage,
  userprofile,
  phone,
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
};
