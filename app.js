const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
// const errorController = require('./controllers/error');
const User = require('./models/user');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User.findById('5ee010efad9cf91b3b6d3aab')
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// app.use(errorController.get404);

mongoose
    .connect('mongodb+srv://AlamAlcantara:P5yJwqYKu2pTKHvA@cluster0-94bqq.mongodb.net/test?retryWrites=true&w=majority')
    .then(result => {
        User.findOne().then(user =>{
            if(!user){
                const user = new User({
                    name: 'Alam',
                    email:  'alam@gmail.com',
                    cart: {
                        items: []
                    }
                });
        
                user.save();
            }
        })
        console.log('CONNECTED!');
        app.listen(5000);
    })
    .catch(err => console.log(err));