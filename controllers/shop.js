const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(products => {
        res.render('shop/product-list', {
            prods: products, 
            pageTitle: 'Shop', 
            path: '/products', 
            hasProducts: products.length > 0,
            activeShop: true, 
            productCSS: true});
    })
    .catch(err => console.log(err));

};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
    .then((product) => {
        res.render('shop/product-detail', 
        {
            product: product, 
            pageTitle: product.title, 
            path: '/products'
        })
    })
    .catch(err => console.log(err));

};

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
    .then(products => {
        res.render('shop/index', {
            prods: products, 
            pageTitle: 'All Products', 
            path: '/'
        });
    })
    .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user
    .getCart()
    .then(products => {
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products 
        })
    })
    .catch(err => console.log(err));
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
    req.user.getOrders()
    .then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your orders',
            orders: orders
        })
    })
    .catch(err => console.log(err));

}

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;

    req.user
    .deleteItemFromCart(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err))
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;

    req.user.addOrder()
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err))
}