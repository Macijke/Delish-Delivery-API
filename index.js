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
const getCurrentDateTime = require('./src/date-format.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {registerFormValidationRules, validateRegister, validateEdit, editFormValidationRules} = require("./src/validation");
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
        userId: new ObjectId(req.body.userId),
        items: req.body.items,
        date: getCurrentDateTime(),
        status: 'W trakcie realizacji',
        totalPrice: req.body.totalPrice
    });
    try {
        await orderDB.save();
        return res.status(200).send("Dodano do bazy danych!")
    } catch (error) {
        console.error(error);
        return res.status(500).send('Błąd przy zapisie zamówienia');
    }
});

app.post('/editData', editFormValidationRules(), validateEdit, async (req, res) => {
    await connectDB();
    const {userId, adressCity, adressStreet, adressNumber, adressLocal} = req.body;
    await models.User.findOneAndUpdate({_id: new ObjectId(userId)}, {
        adressCity: adressCity,
        adressStreet: adressStreet,
        adressNumber: adressNumber,
        adressLocal: adressLocal ? adressLocal : ''
    });
    const user = await models.User.findOne({_id: new ObjectId(userId)});
    res.status(200).json(user);
});

app.get('/food/:foodId', async (req, res) => {
    await connectDB();
    res.status(200).json(await models.Menu.find({_id: new ObjectId(req.params.foodId)}));
});

app.post('/login', async (req, res) => {
    await connectDB();
    const user = await models.User.find({email: req.body.email, password: req.body.password});
    res.status(200).json(user[0] ? user[0] : "error");
});

app.get('/orderHistory/:userId', async (req, res) => {
    await connectDB();
    const orders = await models.Order.find({userId: new ObjectId(req.params.userId)});

    if (!orders) {
        return res.status(404).json({ message: 'Orders not found' });
    }

    const historyOrders = [];

    for (let order of orders) {
        const items = [];
        for (let item of order.items) {
            const food = await models.Menu.findOne({_id: new ObjectId(item.foodId)});
            if (food) {
                items.push({
                    name: food.name,
                    price: item.price,
                    products: food.products,
                    meat: item.meat,
                    sauce: item.sauce,
                    images: food.images
                });
            }
        }

        historyOrders.push({
            _id: order._id,
            date: order.date,
            totalPrice: order.totalPrice,
            status: order.status,
            items: items
        });
    }

    res.status(200).json(historyOrders);
});

app.post('/signup', registerFormValidationRules(), validateRegister, (req, res) => {
    const {firstName, lastName, email, password, adressCity, adressStreet, adressNumber, adressLocal} = req.body;
    const user = new models.User({
        _id: new ObjectId(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        adressCity: adressCity,
        adressStreet: adressStreet,
        adressNumber: adressNumber,
        adressLocal: adressLocal ? adressLocal : ''
    });
    user.save();
    res.status(200).json({message: 'Użytkownik został dodany do bazy danych!'});
});

app.get('/change/status/:orderId/:status', async (req, res) => {
    const {orderId, status} = req.params;
    const statusMessages = {
        1 : 'W trakcie przygotowania',
        2 : 'Przekazane do kuriera',
        3 : 'Zrealizowane',
        4 : 'Anulowane'
    }
    await connectDB();
    await models.Order.findOneAndUpdate({_id: new ObjectId(orderId)}, {status: statusMessages[status]});
    res.status(200).json({message: 'Status zamówienia został zmieniony!'});
});

app.get('*', (req, res) => {
    res.status(200).json({'message': 'Nie znaleziono odnośnika do takiej strony!', 'code': 404});
});

app.listen(3333);