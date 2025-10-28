# 🍔 Delish Delivery API

> RESTful API backend for Delish Delivery food ordering platform built with Node.js and Express

![JavaScript](https://img.shields.io/badge/JavaScript-100%25-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 About The Project

Delish Delivery API is a robust RESTful backend service that powers the Delish Delivery food ordering platform. Built with Node.js and Express, it provides secure authentication, order management, and real-time data processing for restaurants and customers.

### ✨ Key Features

- 🔐 JWT-based authentication and authorization
- 📦 Complete CRUD operations for orders, restaurants, and menus
- 🛡️ Input validation and error handling middleware
- 🗄️ Database integration with MongoDB/PostgreSQL
- 📊 Order tracking and status management
- 🔄 RESTful API design following industry best practices
- 📝 Comprehensive API documentation

### 🛠️ Built With

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** MongoDB / PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Express Validator
- **Security:** Helmet.js, CORS, bcrypt

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB or PostgreSQL database

### Installation

1. Clone the repository
   
```git clone https://github.com/Macijke/Delish-Delivery-API.git```

3. Navigate to the project directory
   
```cd Delish-Delivery-API```

5. Install dependencies
   
```npm install```

6. Create `.env` file in the root directory
   
```
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

7. Start the development server
   
```npm start```

The API will be running at `http://localhost:5000`

### Running Tests

`npm test`


## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create new restaurant (Admin)
- `PUT /api/restaurants/:id` - Update restaurant (Admin)
- `DELETE /api/restaurants/:id` - Delete restaurant (Admin)

### Orders
- `GET /api/orders` - Get all orders (User's own orders)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Menu Items
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` - Add menu item (Restaurant owner)
- `PUT /api/menu/:id` - Update menu item (Restaurant owner)
- `DELETE /api/menu/:id` - Delete menu item (Restaurant owner)

## 🗂️ Project Structure

```
Delish-Delivery-API/
├── src/
│ ├── config/ # Configuration files (database, env variables)
│ ├── controllers/ # Route controllers (business logic)
│ ├── models/ # Database models and schemas
│ ├── routes/ # API route definitions
│ ├── middlewares/ # Custom middleware (auth, validation, error handling)
│ ├── services/ # Business logic services
│ ├── utils/ # Helper functions and utilities
│ ├── app.js # Express app setup
│ └── server.js # Server initialization
├── tests/ # Test files
├── .env # Environment variables (not in repo)
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP headers security with Helmet.js
- CORS configuration
- Input validation and sanitization
- Rate limiting to prevent abuse
- SQL injection and XSS protection

## 👨‍💻 Author

**Maciej** - [GitHub Profile](https://github.com/Macijke)

## 🔗 Related Projects

- [Delish Delivery Frontend](https://github.com/Macijke/Delish-Delivery) - React frontend application

---

⭐ If you find this project useful, please consider giving it a star!
