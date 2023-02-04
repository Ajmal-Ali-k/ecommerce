require("dotenv/config");
const User = require("../model/user/userModel");
const { productPhotos } = require("../helpers/multer");
const Product = require("../model/admin/productSchema");
const Category = require("../model/admin/catagorySchema");
const { catagory } = require("./userController");
const Order = require("../model/user/order");
const Address = require("../model/user/address");

const index_get = (req, res) => {
  res.render("admin/index");
};
//product list
const productList_get = async (req, res) => {
  const pdlist = await Product.find({});
  res.render("admin/product-list", { pdlist });
};
const productAdd_get = async (req, res) => {
  const findCategory = await Category.find({});
  console.log(findCategory);
  res.render("admin/product-add", { findCategory });
};
const sign_get = (req, res) => {
  res.render("admin/sign-in");
};
const userProfile_get = (req, res) => {
  res.render("admin/user-profile");
};

//user list rendering

const userlist = async (req, res) => {
  const finduser = await User.find({});
  console.log(finduser);
  res.render("admin/user-list", { finduser });
};
//=============add category  page rendering==================//

const addCategory = async (req, res) => {
  const cat = await Category.find({});
  console.log(cat);
  res.render("admin/add-category", { cat });
};

//************** add catagory post ************* */

const postCategory = async (req, res) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description,
  });
  category.save((err, doc) => {
    if (err) console.log(err);
    else {
      console.log(doc);
      res.redirect("/admin/add-category");
    }
  });
};

//=================admin signin===============//

const adminMail = process.env.adminMail;
const adminPassword = process.env.adminPassword;
const sign_post = (req, res) => {
  console.log(req.body);
  const admin = req.body.email;
  const password = req.body.password;
  if (adminMail == admin && adminPassword == password) {
    console.log("admin login success");
    req.session.admin = true;
    req.session.save();

    res.render("admin/index");
  } else {
    res.redirect("/admin");
  }
};

let adminLogout = (req, res) => {
  req.session.admin = null;
  res.redirect("/");
};

let userblock = async (req, res) => {
  const id = req.params.id;
  const status = await User.updateOne({ _id: id }, { $set: { block: true } });

  res.redirect("/admin/user-list");
};

let userunblock = async (req, res) => {
  const id = req.params.id;
  const status = await User.updateOne({ _id: id }, { $set: { block: false } });

  res.redirect("/admin/user-list");
};

let productDelete = async (req, res) => {
  const id = req.params.id;
  const status = await Product.updateOne({ _id: id },{$set:{delete:true}});
  res.redirect("/admin/product-list");
};
let undoDelete = async (req, res) => {
  const id = req.params.id;
  const status = await Product.updateOne({ _id: id },{$set:{delete:false}});
  res.redirect("/admin/product-list");
};


let catagoryDelete = async (req, res) => {
  console.log('hiiiiiiiidaaaaaaaaaa')
  const id = req.query.catID;
  const status = await Category.deleteOne({ _id: id });
  // res.redirect("/admin/add-category");
  res.json({status:true});
};

let updatePpage = async (req, res) => {
  const id = req.params.id;
  const userOne = await Product.findOne({ _id: id });
  const catago = await Category.find();
  res.render("admin/edit-product", { userOne, catago });
};


//============update product=================//

const updateproduct = async (req, res) => {
  try {
    const Id = req.params.id;
    console.log(req.body, "from the updateprodct");

    let image = req.files;
    if (image == !null) {
      let img = [];
      for (let i = 0; i < image.length; i++) {
        img[i] = image[i].path.substring(6);
      }
      const {
        product,
        brand,
        price,
        quantity,
        categories,
        discription,
        discount,
        size,
        colour,
      } = req.body;
      console.log(req.body);
      const updatedproduct = await Product.findOneAndUpdate(
        { _id: Id },
        {
          product_name: product,
          brand: brand,
          price: price,
          quantity: quantity,
          catagory: categories,
          discription: discription,
          discount: discount,
          size: size,
          colour: colour,
          image: img,
        }
      );
    } else {
      const {
        product,
        brand,
        price,
        quantity,
        categories,
        discription,
        discount,
        size,
        colour,
      } = req.body;
      const updatedproduct = await Product.findOneAndUpdate(
        { _id: Id },
        {
          product_name: product,
          brand: brand,
          price: price,
          quantity: quantity,
          catagory: categories,
          discription: discription,
          discount: discount,
          size: size,
          colour: colour,
        }
      );
    }
    res.redirect("/admin/product-list");
  } catch (error) {
    console.log(error);
  }
};

//========add product============//

const productAdd_post = async (req, res) => {
  console.log(req.body);
  const {
    product,
    discription,
    brand,
    discount,
    price,
    categories,
    quantity,
    size,
    colour,
  } = req.body;
  let image = req.files;
  console.log(image);
  let img = [];
  for (let i = 0; i < image.length; i++) {
    img[i] = image[i].path.substring(6);
  }
  console.log(img);
  console.log(categories);
  const productadding = await Product.create(
    {
      product_name: product,
      brand: brand,
      colour: colour,
      price: price,
      quantity: quantity,
      catagory: categories,
      image: img,
      discription: discription,
      discount: `${discount}%OFF`,
      size: size,
    },
    (err, dar) => {
      if (err) console.log(err);
    }
  );
  res.redirect("/admin/product-add");
};

const orderHistory = async (req,res) =>{
    const orderlist = await Order.find({}).populate("userId").sort({date : -1})  

  res.render('admin/order-history',{orderlist})
  console.log("hi");
}
const orderInvoice = async (req,res) =>{
  const orderId = req.query.orderId
  const order = await Order.findOne({_id : orderId}).populate('products.product')
  const OrderedAddress = order.address
  const address = await Address.findOne({user:order.userId})
  const index = address.address.findIndex((obj)=> obj._id == OrderedAddress) ;
  const finalAddress =address.address[index];

  
  res.render("admin/invoice",{order,finalAddress})
}
//*********** ******************/

module.exports = {
  index_get,
  userlist,
  productList_get,
  productAdd_get,
  sign_get,
  sign_post,
  userProfile_get,
  userblock,
  userunblock,
  addCategory,
  productAdd_post,
  postCategory,
  productDelete,
  catagoryDelete,
  updatePpage,
  updateproduct,
  adminLogout,
  orderHistory,
  orderInvoice,
  undoDelete
};
