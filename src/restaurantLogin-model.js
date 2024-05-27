const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let restaurantLoginSchema = new Schema({
    _id:Object,
    login:String,
    password:String,
    restaurantId:String
});

module.exports = mongoose.model('restaurantLogins', restaurantLoginSchema);