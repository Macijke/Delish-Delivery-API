const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let courierSchema = new Schema({
    _id:Object,
    login:String,
    password:String,
    currentOrder: String,
    deliveredOrders: Array,
});

module.exports = mongoose.model('couriers', courierSchema);