const { Router } = require ('express');
const adminController = require('../controllers/adminController'); 
const { productPhotos } = require('../helpers/multer');
const {verifyAdmin} = require("../middleware/adminverify")

const router = Router()
router.get('/',adminController.sign_get);
router.post('/index',adminController.sign_post);
router.get('/adminHome',verifyAdmin,adminController.adminHome)
router.get('/user-list',verifyAdmin,adminController.userlist);
router.get('/product-list',verifyAdmin,adminController.productList_get);
router.get('/product-add',verifyAdmin,adminController.productAdd_get);
router.get('/profile',verifyAdmin,adminController.userProfile_get);
router.get('/block/:id',verifyAdmin,adminController.userblock);
router.get('/unblock/:id',verifyAdmin,adminController.userunblock);
router.get('/add-category',verifyAdmin,adminController.addCategory)
router.post('/add-product',verifyAdmin,productPhotos,adminController.productAdd_post)
router.post('/catagory',verifyAdmin,adminController.postCategory)
router.get('/deleteproduct/:id',verifyAdmin,adminController.productDelete)
router.get('/undodelete/:id',verifyAdmin,adminController.undoDelete)
router.delete('/deleteCategory',verifyAdmin,adminController.catagoryDelete);
router.get('/updateproduct/:id',verifyAdmin,adminController.updatePpage)
router.post('/updateproduct/:id',verifyAdmin,adminController.updateproduct)
router.get('/logout',verifyAdmin,adminController.adminLogout);
router.get('/orderHistory',verifyAdmin,adminController.orderHistory)
router.get('/invoice',verifyAdmin,adminController.orderInvoice)
router.get('/coupon',verifyAdmin,adminController.coupon)
router.post('/coupon',verifyAdmin,adminController.postaddCoupon)
router.get('/coupon/:id',verifyAdmin,adminController.deleteCoupon)
router.post('/orderstatus',verifyAdmin,adminController.orderStatus)
router.get('/dailyreport',verifyAdmin,adminController.dailyreport)
router.get('/monthlyreport',verifyAdmin,adminController.monthlyreport)
router.get('/yearlyreport',verifyAdmin,adminController.yearlyreport)
router.get('/createBanner',verifyAdmin,adminController.createbanner)
router.post('/createBanner',verifyAdmin,productPhotos,adminController.addbanner)
router.get('/bannerlist',verifyAdmin,adminController.listbanner)
router.delete('/deletebanner',verifyAdmin,adminController.deleteBanner)
module.exports = router;