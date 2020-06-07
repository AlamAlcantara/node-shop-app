//DB CREDENTIALS
//USER: AlamAlcantara
//PASSWORD: P5yJwqYKu2pTKHvA
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://AlamAlcantara:P5yJwqYKu2pTKHvA@cluster0-94bqq.mongodb.net/test?retryWrites=true&w=majority')
    .then(client => {
        console.log('CONNECTED!');
        _db = client.db();
        callback(client);
    })
    .catch(err => {
        console.log(err)
        throw err;
    });
}

const getDb = () => {
    if(_db){
        return _db;
    }

    return 'No Database Found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
