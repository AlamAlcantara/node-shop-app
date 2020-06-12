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
            isAuthenticated: req.session.isLoggedIn });
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
            path: '/products',
            isAuthenticated: req.session.isLoggedIn
        })
    })
    .catch(err => console.log(err));

};

exports.getIndex = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/index', {
            prods: products, 
            pageTitle: 'All Products', 
            path: '/',
            isAuthenticated: req.session.isLoggedIn
        });
    })
    .catch(err => console.log(err));
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
            isAuthenticated: req.session.isLoggedIn 
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
        isAuthenticated: req.session.isLoggedIn
    })
}

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.session.user._id})
    .then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your orders',
            orders: orders,
            isAuthenticated: req.session.isLoggedIn
        })
    })
    .catch(err => console.log(err));

}

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;

    req.user
    .removeFromCart(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err))
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
    .catch(err => console.log(err))
}