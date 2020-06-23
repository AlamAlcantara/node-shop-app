const express = require('express');
const router= express.Router();
const {body} = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuthMiddleWare = require('../middleware/is-auth');


// /admin/add-product => GET
router.get('/add-product', isAuthMiddleWare, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',[
    body('title', 'Invalid title').trim().isString().isLength({min: 3}),
    body('price', 'Invalid price').isFloat(),
    body('description', 'Invalid description').trim().isLength({min: 5, max: 200})
], isAuthMiddleWare, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuthMiddleWare, adminController.getEditProduct);

router.post('/edit-product',[
    body('title', 'Invalid title').trim().isString().isLength({min: 3}),
    body('price', 'Invalid price').isFloat(),
    body('description', 'Invalid description').trim().isLength({min: 5, max: 200})
], isAuthMiddleWare, adminController.postEditProduct);

router.delete('/product/:productId', isAuthMiddleWare, adminController.deleteProduct);

module.exports = router;