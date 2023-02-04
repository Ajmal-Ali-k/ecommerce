const { Router } = require ('express');
const adminController = require('../controllers/adminController'); 
const { productPhotos } = require('../helpers/multer');
const {verifyAdmin} = require("../middleware/adminverify")

const router = Router()
router.get('/',adminController.sign_get);
router.post('/',adminController.sign_post);
router.get('/index',verifyAdmin,adminController.index_get);
router.get('/user-list',verifyAdmin,adminController.userlist);
router.get('/product-list',verifyAdmin,adminController.productList_get);
router.get('/product-add',verifyAdmin,adminController.productAdd_get);
router.get('/profile',adminController.userProfile_get);
router.get('/block/:id',adminController.userblock);
router.get('/unblock/:id',adminController.userunblock);
router.get('/add-category',verifyAdmin,adminController.addCategory)
router.post('/add-product',verifyAdmin,productPhotos,adminController.productAdd_post)
router.post('/catagory',adminController.postCategory)
router.get('/deleteproduct/:id',adminController.productDelete)
router.get('/undodelete/:id',adminController.undoDelete)
router.delete('/deleteCategory',adminController.catagoryDelete);
router.get('/updateproduct/:id',adminController.updatePpage)
router.post('/updateproduct/:id',adminController.updateproduct)
router.get('/logout',adminController.adminLogout);
router.get('/orderHistory',adminController.orderHistory)
router.get('/invoice',adminController.orderInvoice)
module.exports = router;