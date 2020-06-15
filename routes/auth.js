const express = require('express');
const {check, body} = require('express-validator/check');
const router= express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
    body('password', 'Please enter a valid password')
    .isLength({min: 5})
    .isAlphanumeric()
], authController.postLogin);

router.post('/signup', [
    check('email').isEmail().withMessage('Please enter a valid email')
    .custom((value, {req}) => {
       return User.findOne({email: value})
        .then(userDoc => {
            if(userDoc) {
                return Promise.reject('E-mail already exists.');
            }
        });
    })
    .normalizeEmail(),
    body('password', 'Please enter a valid password with only text and numbers and at least 5 characters')
    .isLength({min: 5})
    .isAlphanumeric(),
    body('confirmPassword')
    .custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Passwords have to match'); 
        }
        return true;
    })
], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);


module.exports = router;