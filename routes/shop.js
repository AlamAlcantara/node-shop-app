const express = require('express');
const router= express.Router();
const shopController = require('../controllers/shop');
const isAuthMiddleWare = require('../middleware/is-auth');


router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuthMiddleWare, shopController.getCart);

router.post('/cart', isAuthMiddleWare, shopController.postCart);

router.post('/cart-delete-item', isAuthMiddleWare, shopController.postCartDeleteItem);

router.get('/orders', isAuthMiddleWare, shopController.getOrders);

router.get('/orders/:orderId', isAuthMiddleWare, shopController.getInvoice);

// router.post('/create-order', isAuthMiddleWare, shopController.postOrder);

router.get('/checkout', isAuthMiddleWare, shopController.getCheckout);

router.get('/checkout/success', isAuthMiddleWare, shopController.getCheckoutSucess);

router.get('/checkout/cancel', isAuthMiddleWare, shopController.getCheckout);



module.exports = router;