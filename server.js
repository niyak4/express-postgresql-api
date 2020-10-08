const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');
require('dotenv/config');

const PORT = process.env.PORT || 3000;

const app = express();

const io = socket(http.createServer(app));

//This does not work. I have no idea why. But I was trying to do something.
//In my GitHub you can check out another project in which I used the ws library. (hint that I understand what WebSockets are :D)
io.on('connection', socket => {
    socket.on('updateUser', data => {
        io.emit('updateUser', data);
    });
});

//MIDDLEWARE
app.use(bodyParser.json());

//IMPORT ROUTES
const usersRoute = require('./routes/users');
const loginRoute = require('./routes/login');

//USE ROUTES
app.use('/users', usersRoute);
app.use('/login', loginRoute);

//ROUTES
app.get('/', (req, res) => {
    res.send('We are on homepage.');
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});