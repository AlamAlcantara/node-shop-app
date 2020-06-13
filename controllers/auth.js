const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const {SENDGRID_API_KEY} = require('../config');


const trasnporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key: SENDGRID_API_KEY
    }
}));


exports.getLogin = (req, res, next) => {
    let errorMessage = req.flash('error');

    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    }else {
        errorMessage = null;
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errorMessage
    })
}

exports.getSignup = (req, res, next) => {
    let errorMessage = req.flash('error');

    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    }else {
        errorMessage = null;
    }

    res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: errorMessage
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
    .then(user => {

        if(!user) {
            req.flash('error', 'Invalid E-mail or Passowrd.');
            return res.redirect('/login');
        }

        bcrypt.compare(password, user.password)
        .then(doMatch => {
            if(doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
               return req.session.save((err) => {
                    console.log(err);
                    res.redirect('/');
                });
            }

            req.flash('error', 'Invalid E-mail or Passowrd.');
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        })
    })
    .catch(err => console.log(err));

}

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({email: email})
    .then(userDoc => {
        if(userDoc) {
            req.flash('error', 'E-mail already exists.');
            return res.redirect('/signup');
        }

        return bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    cart: {items: []}
                });

                return user.save();
            })
            .then(result => {
                res.redirect('/login');
                return trasnporter.sendMail({
                    to: email,
                    from: 'alamalcantara99@gmail.com',
                    subject: 'Sign Up Completed',
                    html: `<h1>Congrats ${name}, You seccesfully signed up!</h1>`
                });
            })
            .catch(err => console.log(err));
    })
    .catch(err => console.log(err));

};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}