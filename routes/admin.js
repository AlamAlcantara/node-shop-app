const express = require('express');
const router= express.Router();

const adminController = require('../controllers/admin');
const isAuthMiddleWare = require('../middleware/is-auth');

// /admin/add-product => GET
router.get('/add-product', isAuthMiddleWare, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuthMiddleWare, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuthMiddleWare, adminController.getEditProduct);

router.post('/edit-product', isAuthMiddleWare, adminController.postEditProduct);

router.post('/delete-product', isAuthMiddleWare, adminController.postDeleteProduct);

module.exports = router;