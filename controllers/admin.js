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
    const user = req.user;

    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const product = new Product({title, price, description, imageUrl, userId: user});
    product.save()
    .then((result) => {
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
    Product.findById(productId)
    .then(product => {
        if(!product){
            return res.redirect('/');
        }

        res.render('admin/edit-product',{
            pageTitle: 'Edit product', 
            path: '/admin/edit-product', 
            activeAddProduct: true, formsCSS: true, productCSS:true,
            editting: editMode,
            product: product,
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

    Product.findById(prodId).then(product => {
        if(product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImage;

        return product.save()    
        .then(() => {
            res.redirect('/admin/products');
        });
    })
    .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
    // req.session.user.getProducts()
    Product.find({userId: req.user._id})
    .populate('userId')
    .then(products => {
        console.log('PRODUCTS: ', products);

        res.render('admin/products', {
            prods: products, 
            pageTitle: 'All Products', 
            path: '/admin/products',
        });
    })
    .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id})
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err))
}