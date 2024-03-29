const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const {SENDGRID_API_KEY, PORT} = require('../config');
const crypto = require('crypto');
const {validationResult} = require('express-validator/check');


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
        errorMessage: errorMessage,
        oldInput: {email: '', password: ''},
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
    errorMessage: errorMessage,
    oldInput: {name: '', email: '', password: '', confirmPassword: ''},
    validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422)
        .render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid E-mail or Passowrd.',
            oldInput: {email, password},
        })
    }

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
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422)
        .render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {name, email, password, confirmPassword},
            validationErrors: errors.array()
            });
    }

    bcrypt.hash(password, 12)
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
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}

exports.getReset = (req,res,next) => {
    let errorMessage = req.flash('error');

    if(errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    }else {
        errorMessage = null;
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: errorMessage
    })
}

exports.postReset = (req,res,next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findOne({email: req.body.email})
        .then(user => {
            if(!user) {
                req.flash('error', 'No account with that email found');
                return res.redirect('/reset');
            }

            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
             trasnporter.sendMail({
                to: req.body.email,
                from: 'alamalcantara99@gmail.com',
                subject: 'Password Rest',
                html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:${PORT}/reset/${token}">link</a> to set a new password</p>
                `
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    })
}

exports.getNewPassword = (req, res, next) => {

    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        let errorMessage = req.flash('error');

        if(errorMessage.length > 0) {
            errorMessage = errorMessage[0];
        }else {
            errorMessage = null;
        }
    
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'Update Password',
            errorMessage: errorMessage,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postNewPassword = (req, res, next) =>{
    const password = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId})
        .then(user => {
            resetUser = user;
            return bcrypt.hash(password, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}