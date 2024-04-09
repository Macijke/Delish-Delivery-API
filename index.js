const express = require("express");
const mongoose = require("mongoose");
const models = {
    Restaurant: require("./src/restauration-model.js"),
    Menu: require('./src/menu-model.js'),
    Filter: require('./src/filter-model.js'),
    User: require('./src/user-model.js'),
    Order: require('./src/order-model.js'),
    Recommendation: require('./src/recommendation-model.js'),
};
const DateFormatted = require('./src/date-format.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ObjectId = mongoose.Types.ObjectId;
const app = express();

app.use(cookieParser(), bodyParser.urlencoded({extended: true}), bodyParser.json());
app.set('trust proxy', 1);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const connectDB = async () => mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");

app.get('/restaurants', async (req, res) => {
    await connectDB();
    res.json(await models.Restaurant.find());
});

app.get('/recommendations/:day', async (req, res) => {
    await connectDB();
    res.json(await models.Recommendation.find({promotionDay: req.params.day}));
});

app.get('/restaurants/:filters', async (req, res) => {
    await connectDB();
    const filter = await models.Filter.find({name: req.params.filters});
    res.status(200).json(filter[0] ? await models.Restaurant.find({type: req.params.filters}) : "error");
});

app.get('/menu/:restaurationId', async (req, res) => {
    await connectDB();
    const restaurant = await models.Restaurant.find({_id: new ObjectId(req.params.restaurationId)});
    res.status(200).json(restaurant[0] ? await models.Menu.find({restaurant_id: new ObjectId(req.params.restaurationId)}) : "error");
});

app.get('/menu/:restaurationId/:foodId', async (req, res) => {
    await connectDB();
    const restaurant = await models.Restaurant.find({_id: new ObjectId(req.params.restaurationId)});
    res.status(200).json(restaurant[0] ? await models.Menu.find({_id: new ObjectId(req.params.foodId)}) : "error");
});

app.post('/makeOrder', async (req, res) => {
    await connectDB();
    const orderDB = new models.Order({
        _id: new ObjectId(),
        userId: new ObjectId('6586e4bd183cdec09cd5d08d'),
        items: req.body,
        date: DateFormatted
    });
    try {
        await orderDB.save();
        return res.status(200).send("Dodano do bazy danych!")
    } catch (error) {
        console.error(error);
        return res.status(500).send('Błąd przy zapisie zamówienia');
    }
});

app.get('/order/:userId', async (req, res) => {
    await connectDB();
    const user = await models.User.find({_id: new ObjectId(req.params.userId)});
    res.status(200).json(user[0] ? await models.Order.find({userId: new ObjectId(req.params.userId)}) : "error");
});

app.get('*', (req, res) => {
    res.status(200).json({'message': 'Nie znaleziono odnośnika do takiej strony!', 'code': 404});
});

app.listen(3333);