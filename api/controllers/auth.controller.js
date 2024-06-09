const User = require('../models/user.model.js');
const bcryptjs = require('bcryptjs');
const errorHandler = require('../utils/error.js');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "123123123";

const AuthController = {
    signUp: async (req, res, next) => {
        const {username, email, password} = req.body;

        if (
            !username ||
            !email ||
            !password ||
            username === '' ||
            email === '' ||
            password === ''
        ) {
            next(errorHandler(400, 'Не все поля заполнены'));
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        try {
            await newUser.save();
            res.json('Регистрация успешна');
        } catch (error) {
            next(error);
        }
    },
    signIn: async (req, res, next) => {
        const {email, password} = req.body;

        if (!email || !password || email === '' || password === '') {
            next(errorHandler(400, 'Не все поля заполнены'));
        }

        try {
            const validUser = await User.findOne({email});
            if (!validUser) {
                return next(errorHandler(404, 'Пользователь не найден'));
            }
            const validPassword = bcryptjs.compareSync(password, validUser.password);
            if (!validPassword) {
                return next(errorHandler(400, 'Пароль неверный'));
            }
            const token = jwt.sign(
                {id: validUser._id, isAdmin: validUser.isAdmin},
                JWT_SECRET
            );

            const {password: pass, ...data} = validUser;

            res
                .status(200)
                .cookie('access_token', token, {
                    httpOnly: true,
                })
                .json(data);
        } catch (error) {
            next(error);
        }
    },
    google: async (req, res, next) => {
        const {email, name, googlePhotoUrl} = req.body;
        try {
            const user = await User.findOne({email});
            if (user) {
                const token = jwt.sign(
                    {id: user._id, isAdmin: user.isAdmin},
                    JWT_SECRET
                );
                const {password, ...rest} = user;
                res
                    .status(200)
                    .cookie('access_token', token, {
                        httpOnly: true,
                    })
                    .json(rest);
            } else {
                const generatedPassword =
                    Math.random().toString(36).slice(-8) +
                    Math.random().toString(36).slice(-8);
                const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
                const newUser = new User({
                    username:
                        name.toLowerCase().split(' ').join('') +
                        Math.random().toString(9).slice(-4),
                    email,
                    password: hashedPassword,
                    profilePicture: googlePhotoUrl,
                });
                await newUser.save();
                const token = jwt.sign(
                    {id: newUser._id, isAdmin: newUser.isAdmin},
                    JWT_SECRET
                );
                const {password, ...rest} = newUser._doc;
                res
                    .status(200)
                    .cookie('access_token', token, {
                        httpOnly: true,
                    })
                    .json(rest);
            }
        } catch (error) {
            next(error);
        }
    },
}


module.exports = AuthController;