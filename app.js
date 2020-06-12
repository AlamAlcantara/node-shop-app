const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://AlamAlcantara:P5yJwqYKu2pTKHvA@cluster0-94bqq.mongodb.net/test?retryWrites=true&w=majority';

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
    });

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}));

app.use((req, res, next) => {
    if(!req.session.user) {
        next();
    } else {
        User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
    }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI)
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