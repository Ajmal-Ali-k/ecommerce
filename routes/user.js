const { Router } = require ('express');
const userController = require('../controllers/userController');
const {verifyUser,verifyLogin} = require('../middleware/userverify')


const router = Router();


router.get('/',userController.index_get);
router.get('/signup',userController.signup_get);
router.post('/signup-post',userController.signup_post);
router.get('/login',userController.userLogin_get);
router.get('/logout',userController.logout)
router.post('/login-post',userController.userLogin_post);
router.get('/catagory',userController.catagory);
router.get('/products',userController.productspage)
router.get('/profile',verifyUser,userController.userprofile);
router.get('/phone',userController.phone)
router.get('/phone/otp',userController.otp);
router.get('/previewpage',userController.previewPage);
router.get('/wishlist',userController.wishlist);
router.get('/cart',verifyUser,userController.getCart)
router.get('/addToCart/:id',verifyLogin,userController.addTocart),
router.delete('/removeCart/:id',userController.removeCart)
router.get('/checkout',userController.checkout)
router.patch('/cartQuantity',userController.cartQuantity)
router.post('/address',userController.addAddres)
router.get('/deleteAddress/:id',userController.deleteAddress)
router.get('/success',userController.orderSuccess)
router.get('/logout',userController.logout)
router.post('/placeOrder',userController.placeOrder)
router.get('/history',userController.orderHistory)
router.post('/verifypayment',userController.varifypayment)
router.post('/create-order',userController.createOrder)
router.get('/orderDetails',userController.orderDetails)
router.post('/couponcheck',userController.couponcheck)
router.put('/cancelorder',userController.cancelOrder)
router.post('/otp_verify',userController.otpverify)









module.exports = router;