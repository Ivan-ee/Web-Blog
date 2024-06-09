const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

dotenv.config();

mongoose
    .connect('mongodb://admin:123@localhost:27017/mongo?authSource=admin&directConnection=true')
    .then(() => {
        console.log('Бд подлючена');
    })
    .catch((err) => {
        console.log(err);
    });

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', require('./routes'));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// });

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000!');
});

app.use(express.static(path.join(__dirname, '/client/dist')));

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});
