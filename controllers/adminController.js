require("dotenv/config");
const User = require("../model/user/userModel");
const { productPhotos } = require("../helpers/multer");
const Product = require("../model/admin/productSchema");
const Category = require("../model/admin/catagorySchema");
const { catagory } = require("./userController");
const Order = require("../model/user/order");
const Address = require("../model/user/address");
const Coupon = require('../model/admin/coupon');
const { find } = require("../model/user/userModel");
const Banner =require('../model/admin/banner')

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
  
  const id = req.query.catID;
  const status = await Category.deleteOne({ _id: id });
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
      discount: discount,
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
const postaddCoupon = async (req, res) => {
  console.log("asdfghjkhg")
 
  const coupon = new Coupon(req.body);
  coupon.save().then(() => {
    res.redirect("/admin/coupon");
  });
};


const coupon = async (req,res)=>{
  const coupon = await Coupon.find({})
  res.render('admin/coupon',{coupon})
}
const deleteCoupon = async (req,res) =>{
  console.log("opoooooooooo")
  const  couponId = req.params.id
  const coupon = await Coupon.deleteOne({_id:couponId})
  res.redirect('/admin/coupon')
}
const orderStatus = async (req, res) => {
  try {
    const orderID = req.query.id;
    const Status = req.query.status;
    console.log(Status, orderID);
    const order = await Order.updateOne(
      { _id: orderID },
      { orderstatus: req.query.status }
    );
    res.json({ Status: true });
  } catch (err) {
    console.log(err);
  }
 
};

/////////////************reports*************/////////////////////

const dailyreport =async (req,res)=>{
  try {
    const dailyReport = await Order.aggregate([{
      $match:{
        orderstatus:{ $eq:"delivered"}
      },
      },
      {
        $group:{
          _id:{
            year:{$year:"$createdAt"},
            month:{$month:"$createdAt"},
            day:{$dayOfMonth:"$createdAt"},
          },
            totalprice : {$sum :"$subtotal"},
            products :{$sum : {$size :"$products"}},
            count :{$sum :1}
        }
      },
      {$sort:{createdAt :-1}}
     
    ])
    console.log(dailyReport[0].totalprice);
    console.log(dailyReport);
    res.render('admin/dailyreport',{dailyReport});
    
  } catch (error) {
    console.log(error)
  }

 
}
const monthlyreport =async (req,res)=>{
  try {
    const monthlyReport = await Order.aggregate([{
      $match:{
        orderstatus:{ $eq:"delivered"}
      },
      },
      {
        $group:{
          _id:{
            year:{$year:"$createdAt"},
            month:{$month:"$createdAt"},
            
          },
            totalprice : {$sum :"$subtotal"},
            products :{$sum : {$size :"$products"}},
            count :{$sum :1}
        }
      },
      {$sort:{createdAt :-1}},     
    ]);
    console.log(monthlyReport)
    function getMonthName(monthNumber){
      const date  = new Date()
      date.setMonth(monthNumber -1);
      return  date.toLocaleDateString('en-US',{month:"long"})
    }
    let month=[];
    for(let i = 0 ;i< monthlyReport.length;i++){
      month.push(getMonthName(monthlyReport[i]._id.month));
    }
    res.render('admin/monthlyreport',{monthlyReport,month})
  }catch(error){
    console.log(error);

  }
}


const yearlyreport =async(req,res)=>{
  try {
    const yearlyReport = await Order.aggregate([
      {$match:{
        orderstatus:{$eq:"delivered"}
      }},
      {
        $group:{
          _id:{
            year:{$year:"$createdAt"}
          },
          totalprice : {$sum :"$subtotal"},
            products :{$sum : {$size :"$products"}},
            count :{$sum :1}
        }
      }

    ])
    console.log(yearlyReport)
    res.render("admin/yearlyreport",{yearlyReport})
    
  } catch (error) {
    console.log(error)
    
  }
}
//*********** cart******************/



const dailyChart = async(req,res)=>{
  try {
    const order = await Order.find({})
    let today = new Date();
    let startDate = new Date(today.setUTCHours(0,0,0,0))
    let endDate = new Date(today.setHours(23,59,59,999))


    const todaySales = await Order.aggregate([
      {
      $match:{
        orderstatus:{$eq:"delivered"},
        createdAt:{$lt:endDate,$gt:startDate}
      },
     },{
      $group:{
        _id:"",
        total:{$sum:"$subtotal"},
        count:{$sum:1}
      },
     },{
      $project:{
        _id:0
      }
     }
    ]);
    const totalAmount = todaySales[0].total
    const totalOrder = todaySales[0].count
    console.log(totalAmount,000000000000000000000)
    res.json({Status:true,totalAmount,totalOrder})

  } catch (error) {
    console.log(error)
    
  }
}
const yearlyChart = async (req, res) => {

  try {
    const yearReport = await Order.aggregate([
      {
        $match: { orderstatus: { $eq: "delivered" } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
          },
          totalprice: { $sum: "$subtotal" },
        },
      },
      { $sort: { "_id.year": -1 } },
    ]);
    let totalSales = [];
    let years = [];
  
    for (let i = 0; i < yearReport.length; i++) {
      totalSales.push(yearReport[i].totalprice);
      years.push(yearReport[i]._id.year);
    }
    console.log(years);
    console.log(totalSales);
  
    res.json({ status: true, totalSales, years });
  } catch (err) {
    console.log(err);
  }
 
};


const createbanner = async(req,res)=>{
  res.render('admin/bannerCreate')
}
const addbanner = async (req,res)=>{
  try {
    console.log(req.files)
    console.log(req.body)
    const image = req.files
    if(image==null){
      res.redirect('/admin/createBanner')
    }else{
      let img= image[0].path.substring(6)
      Object.assign(req.body, { image: img});
      const banner = await Banner.create(
        req.body
      )
    }
    res.redirect('/admin/createBanner')
  } catch (error) {
    console.log(error)
    
  }
}
const listbanner = async (req,res) =>{
  try {
    const banner=await Banner.find({})
    console.log(banner);
    if(banner){
    res.render("admin/bannerlist",{banner})}
  } catch (err) {
    console.log(err);
  }
}
const deleteBanner=async(req,res)=>{
  try {
    
    const bannerID=req.query.dltID
    
    const remove=await Banner.findByIdAndDelete(bannerID)
    res.json({status:true})
  } catch (err) {
   console.log(err); 
  }
 
}

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
  undoDelete,
  coupon,
  postaddCoupon,
  deleteCoupon,
  orderStatus,
  dailyreport,
  monthlyreport,
  yearlyreport,
  createbanner,
  addbanner,
  listbanner,
  deleteBanner
};
