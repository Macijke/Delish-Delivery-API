const express = require("express");
const mongoose = require("mongoose");
const Restauration = require("./src/restauration-model.js");
const Menu = require('./src/menu-model.js');
const Filter = require('./src/filter-model.js');
const User = require('./src/user-model.js');
const Order = require('./src/order-model.js');
const DateFormatted = require('./src/date-format.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ObjectId = mongoose.Types.ObjectId;
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('trust proxy', 1);

app.get('/restaurations', async (req, res) => {
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    res.json(await Restauration.find());
});

app.get('/restaurations/:filters', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    let reqFilter = req.params.filters;
    const filter = await Filter.find({name: reqFilter});
    if (filter[0] == null) {
        res.status(200).json(/* TODO:EROORS */"error");
    } else {
        const restauration = await Restauration.find({type: reqFilter});
        res.status(200).json(restauration);
    }
});

app.get('/menu/:restaurationId', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    let reqrestaurationId = req.params.restaurationId;
    const restauration = await Restauration.find({_id: new ObjectId(reqrestaurationId)});
    if (restauration[0] == null) {
        res.status(200).json(/* TODO:EROORS */"error");
    } else {
        const menu = await Menu.find({restaurant_id: new ObjectId(reqrestaurationId)});
        res.status(200).json(menu);
    }
});

app.post('/makeOrder', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    const order = req.body;
    //TODO: AUTHORIZATION

    try {
        const orderDB = new Order({
            _id: new ObjectId(),
            userId: new ObjectId('6586e4bd183cdec09cd5d08d'),
            items: order,
            date: DateFormatted
        });
        await orderDB.save();
        return res.status(200).send("Dodano do bazy danych!")
    } catch (error) {
        console.error(error);
        return res.status(500).send('Błąd przy zapisie zamówienia');
    }

});

app.get('/order/:userId', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    let reqUserId = req.params.userId;
    const user = await User.find({_id: new ObjectId(reqUserId)});
    if (user[0] == null) {
        res.status(200).json(/* TODO:EROORS */"error");
    } else {
        const orders = await Order.find({userId: new ObjectId(reqUserId)});
        res.status(200).json(orders);
    }
});

app.listen(3000);