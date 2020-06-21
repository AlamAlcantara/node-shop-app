const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        console.log(products)
        res.render('shop/product-list', {
            prods: products, 
            pageTitle: 'Shop', 
            path: '/products', 
            hasProducts: products.length > 0,
            activeShop: true, 
            productCSS: true, 
             });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
    .then((product) => {
        res.render('shop/product-detail', 
        {
            product: product, 
            pageTitle: product.title, 
            path: '/products',
            
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

};

exports.getIndex = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/index', {
            prods: products, 
            pageTitle: 'All Products', 
            path: '/',
            
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getCart = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items;
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products,
             
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
    .then(product => {
        req.user.addToCart(product);
    })
    .then(result => {
        console.log(result);
        res.redirect('/cart');
    });

}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Your checkout', 
        
    })
}

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.session.user._id})
    .then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your orders',
            orders: orders,
            
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;

    req.user
    .removeFromCart(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.postOrder = (req, res, next) => {

    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items.map(i => {
            return {quantity: i.quantity, product: {...i.productId._doc}};
        });

        const order = new Order({
            user:{
                name: req.session.user.name,
                email: req.session.user.email,
                userId: req.session.user
            },
            products: products
        });

        return order.save()
    })
    .then(result => {
        return req.user.clearCart();
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    Order.findById(orderId)
    .then(order => {
        if(!order) {
            return next(new Error('No order found.'));
        }

        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized.'));
        }

        const fileName = 'invoice-'+orderId+'.pdf';
        const invoicePath = path.join('data', 'invoices', fileName); 
        let totalPrice = 0;
        
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true
        });

        pdfDoc.text('--------------------------------');

        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price;
            pdfDoc.fontSize(14).text(prod.product.title+'-'+prod.quantity+'x '+' $'+prod.product.price);
        });

        pdfDoc.text('----');
        pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`);
        pdfDoc.end();
    })
    .catch(err => next(err));
}