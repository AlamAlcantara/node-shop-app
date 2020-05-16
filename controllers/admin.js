const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product',{
        pageTitle: 'Add product', 
        path: '/admin/add-product', 
        activeAddProduct: true, formsCSS: true, productCSS:true,
        editting: false
    }) 
};


exports.postAddProduct =  (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    }).then((result) => {
        console.log('PRODUCT CREATED');
        res.redirect('/admin/products')
    })
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {

    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/');
    }

    const productId = req.params.productId;
    req.user.getProducts({id: productId})
    // Product.findByPk(productId)
    .then(products => {
        const product = products[0];
        if(!product){
            return res.redirect('/');
        }

        res.render('admin/edit-product',{
            pageTitle: 'Edit product', 
            path: '/admin/edit-product', 
            activeAddProduct: true, formsCSS: true, productCSS:true,
            editting: editMode,
            product: product
        }) 
    })
    .catch(err => console.log(err));

};

exports.postEditProduct = (req, res, next) => {
    const prodId =req.body.productId;
    const updatedPrice = req.body.price;
    const updatedTitle = req.body.title;
    const updatedDesc = req.body.description;
    const updatedImage = req.body.imageUrl;

    Product.findByPk(prodId)
    .then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImage;
        product.description = updatedDesc;
        return product.save();
    })
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));

    
}

exports.getProducts = (req, res, next) => {
    req.user.getProducts()
    // Product.findAll()
    .then(products => {
        res.render('admin/products', {
            prods: products, 
            pageTitle: 'All Products', 
            path: '/admin/products'
        });
    })
    .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByPk(prodId)
    .then(product => {
        return product.destroy();
    })
    .then(result => {
        console.log('PRODUCT DESTROYED')
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err))
}