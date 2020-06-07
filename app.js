const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const path = require('path');

const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
// const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    User.findById('5eda7ec3dcf45b69f74f95a3')
    .then(user => {
        req.user = new User(user.username, user.email, user.cart, user._id);
        next();
    })
    .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// app.use(errorController.get404);

mongoConnect(() => {
    app.listen(5000);
})