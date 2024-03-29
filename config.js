if(process.env.NODE_ENV === 'development') {
    const dotenv = require('dotenv');
    dotenv.config();
}

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGO_URI,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY
};