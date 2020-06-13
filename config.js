const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    MONGODB_URI: process.env.MONGO_URI,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
};