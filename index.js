const express = require("express");
const mongoose = require("mongoose");
const models = {
    Restaurant: require("./src/restauration-model.js"),
    Menu: require('./src/menu-model.js'),
    Filter: require('./src/filter-model.js'),
    User: require('./src/user-model.js'),
    Order: require('./src/order-model.js'),
    Recommendation: require('./src/recommendation-model.js'),
    RestaurantLogin: require('./src/restaurantLogin-model.js'),
    Courier: require('./src/courier-model.js')
};
const getCurrentDateTime = require('./src/date-format.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {registerFormValidationRules, validateRegister, validateEdit, editFormValidationRules} = require("./src/validation");
const ObjectId = mongoose.Types.ObjectId;
const app = express();

app.use(cookieParser(), bodyParser.urlencoded({extended: true}), bodyParser.json());'' +
app.use(express.static('public'));
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
        courierSalary: Math.round(Math.random() * (24 - 9) + 9),
        courierId: null,
        status: {
            code: 0,
            text: "W trakie przygotowania"
        },
        totalPrice: req.body.totalPrice,
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

app.post('/login/restaurant', async (req, res) => {
    await connectDB();
    const restaurantLogin = await models.RestaurantLogin.find({login: req.body.login, password: req.body.password});
    res.status(200).json(restaurantLogin[0] ? restaurantLogin[0].restaurantId : false);
});

app.post('/login/courier', async (req, res) => {
   await connectDB();
    const courier = await models.Courier.find({login: req.body.login, password: req.body.password});
    if (courier[0]) {
        res.status(200).json(courier[0]);
    } else {
        res.status(400).json(false);
    }
});

app.get('/setCourierOrder/:courierId/:orderId', async (req, res) => {
    await connectDB();
    await models.Courier.findOneAndUpdate({_id: new ObjectId(req.params.courierId)}, {currentOrder: req.params.orderId});
    if (req.params.orderId !== 'false') await models.Order.findOneAndUpdate({_id: new ObjectId(req.params.orderId)}, {courierId: req.params.courierId});
    res.status(200).json({message: 'Zmieniono zamówienie kuriera!'});
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

app.get('/orderHistory/rest/:restaurantId', async (req, res) => {
    await connectDB();
    const orders = await models.Order.find({"items.restaurantId": req.params.restaurantId});

    if (!orders) {
        return res.status(404).json({ message: 'Orders not found' });
    }

    const restaurantOrders = [];

    for (let order of orders) {
        const user = await models.User.findOne({_id: new ObjectId(order.userId)});
        if (user) {
            const items = [];
            for (let item of order.items) {
                if (item.restaurantId === req.params.restaurantId) { // filter items for the given restaurant
                    const food = await models.Menu.findOne({_id: new ObjectId(item.foodId)});
                    if (food) {
                        items.push({
                            name: food.name, // using food name instead of foodId
                            products: food.products,
                            price: item.price,
                            meat: item.meat,
                            sauce: item.sauce,
                            images: food.images
                        });
                    }
                }
            }

            restaurantOrders.push({
                _id: order._id,
                date: order.date,
                totalPrice: order.totalPrice,
                status: order.status,
                items: items,
                userAddress: {
                    city: user.adressCity,
                    street: user.adressStreet,
                    number: user.adressNumber,
                    local: user.adressLocal
                }
            });
        }
    }

    res.status(200).json(restaurantOrders);
});

app.get('/orderHistory/rest/:restaurantId/:orderId', async (req, res) => {
    await connectDB();
    const orders = await models.Order.find({_id: new ObjectId(req.params.orderId)});

    if (!orders) {
        return res.status(404).json({ message: 'Orders not found' });
    }

    let restaurantOrder;

    for (let order of orders) {
        const user = await models.User.findOne({_id: new ObjectId(order.userId)});
        if (user) {
            const items = [];
            for (let item of order.items) {
                if (item.restaurantId === req.params.restaurantId) {
                    const food = await models.Menu.findOne({_id: new ObjectId(item.foodId)});
                    if (food) {
                        items.push({
                            name: food.name, // using food name instead of foodId
                            products: food.products,
                            price: item.price,
                            meat: item.meat,
                            sauce: item.sauce,
                            images: food.images
                        });
                    }
                }
            }

            restaurantOrder = {
                _id: order._id,
                date: order.date,
                totalPrice: order.totalPrice,
                status: order.status,
                items: items,
                userAddress: {
                    city: user.adressCity,
                    street: user.adressStreet,
                    number: user.adressNumber,
                    local: user.adressLocal
                }
            };
        }
    }

    res.status(200).json(restaurantOrder);
});

app.get('/orderHistory/courier/:orderId', async (req, res) => {
    await connectDB();
    const orders = await models.Order.find({_id: new ObjectId(req.params.orderId)});
    let courierOrder = {};
    let restaurantAdress = '';
    let restaurantName = '';
    for (let order of orders) {
        const user = await models.User.findOne({_id: new ObjectId(order.userId)});
        if (user) {
            const items = [];
            for (let item of order.items) {
                const food = await models.Menu.findOne({_id: new ObjectId(item.foodId)});
                const restaurant = await models.Restaurant.findOne({_id: new ObjectId(item.restaurantId)});
                if (food && restaurant) {
                    restaurantAdress = restaurant.adress.city + ", " + restaurant.adress.street;
                    restaurantName = restaurant.name;
                    items.push({
                        name: food.name,
                        products: food.products,
                        price: item.price,
                        meat: item.meat,
                        sauce: item.sauce,
                        images: food.images
                    });
                }
            }

            courierOrder = {
                _id: order._id,
                date: order.date,
                totalPrice: order.totalPrice,
                status: order.status,
                items: items,
                restaurantAdress: restaurantAdress,
                restaurantName: restaurantName,
                courierSalary: order.courierSalary,
                userAddress: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    city: user.adressCity,
                    street: user.adressStreet,
                    number: user.adressNumber,
                    local: user.adressLocal
                }
            };
        }
    }

    res.status(200).json(courierOrder);
});

app.get('/orderHistoryCourier/', async (req, res) => {
   await connectDB();
    const orders = await models.Order.find();
    const courierOrders = [];
    let restaurantAdress = '';
    let restaurantName = '';
    for (let order of orders) {
        const user = await models.User.findOne({_id: new ObjectId(order.userId)});
        if (user) {
            const items = [];
            for (let item of order.items) {
                const food = await models.Menu.findOne({_id: new ObjectId(item.foodId)});
                const restaurant = await models.Restaurant.findOne({_id: new ObjectId(item.restaurantId)});
                if (food && restaurant) {
                    restaurantAdress = restaurant.adress.city + ", " + restaurant.adress.street;
                    restaurantName = restaurant.name;
                    items.push({
                        name: food.name,
                        products: food.products,
                        price: item.price,
                        meat: item.meat,
                        sauce: item.sauce,
                        images: food.images
                    });
                }
            }

            courierOrders.push({
                _id: order._id,
                date: order.date,
                totalPrice: order.totalPrice,
                status: order.status,
                items: items,
                restaurantAdress: restaurantAdress,
                restaurantName: restaurantName,
                courierSalary: order.courierSalary,
                courierId: order.courierId,
                userAddress: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    city: user.adressCity,
                    street: user.adressStreet,
                    number: user.adressNumber,
                    local: user.adressLocal
                }
            });
        }
    }

    res.status(200).json(courierOrders);
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
        0 : 'W trakcie przygotowania',
        1 : 'Gotowe do odbioru',
        2 : 'Przekazane do kuriera',
        3 : 'Zrealizowane',
        4 : 'Anulowane'
    }
    await connectDB();
    await models.Order.findOneAndUpdate({_id: new ObjectId(orderId)}, {status: {code: status, text: statusMessages[status]}});
    res.status(200).json({message: 'Status zamówienia został zmieniony!'});
});

app.get("/addEarnings/:courierId/:ernings", async (req, res) => {
    await connectDB();
    const courier = await models.Courier.findOneAndUpdate({_id: new ObjectId(req.params.courierId)}, {$inc: {earnings: parseInt(req.params.ernings)}});
    res.status(200).json({message: 'Zaktualizowano zarobki kuriera!'});
});

app.get('*', (req, res) => {
    res.status(200).json({'message': 'Nie znaleziono odnośnika do takiej strony!', 'code': 404});
});

app.listen(3333);