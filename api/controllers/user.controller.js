const bcryptjs = require('bcryptjs');
const errorHandler = require('../utils/error.js');
const User = require('../models/user.model.js');

const UserController = {
    getById: async (req, res, next) => {
        const userId = req.params.userId;

        try {
            const user = await User.findById(userId);

            if (!user) {
                return next(errorHandler(404, 'Пользователь не найден'));
            }

            const {password, ...data} = user;

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        if (req.user.id !== req.params.userId) {
            return next(errorHandler(403, 'У вас нет прав на обновление этого пользователя'));
        }
        if (req.body.password) req.body.password = bcryptjs.hashSync(req.body.password, 10);

        if (req.body.username) {

            if (req.body.username.includes(' ')) {
                return next(errorHandler(400, 'Имя не должно содержать пробелы'));
            }

            if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
                return next(
                    errorHandler(400, 'Имя должно содержать только буквы и цифры')
                );
            }
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(
                req.params.userId,
                {
                    $set: {
                        username: req.body.username.toLowerCase(),
                        email: req.body.email,
                        profilePicture: req.body.profilePicture,
                        password: req.body.password,
                    },
                },
                {new: true}
            );
            const {password, ...data} = updatedUser;
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 9;
            const sortDirection = req.query.sort === 'asc' ? 1 : -1;

            const users = await User.find()
                .sort({createdAt: sortDirection})
                .skip(startIndex)
                .limit(limit);

            const usersWithoutPassword = users.map((user) => {
                const {password, ...data} = user;
                return data;
            });

            const totalUsers = await User.countDocuments();

            const now = new Date();

            const oneMonthAgo = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate()
            );
            const lastMonthUsers = await User.countDocuments({
                createdAt: {$gte: oneMonthAgo},
            });

            res.status(200).json({
                users: usersWithoutPassword,
                totalUsers,
                lastMonthUsers,
            });
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {

        const userId = req.params.userId;

        if (!req.user.isAdmin && req.user.id !== req.params.userId) {
            return next(errorHandler(403, 'У вас нет прав на удалние этого пользователя'));
        }

        try {
            await User.findByIdAndDelete(userId);
            res.status(200).json('Пользователь удален');
        } catch (error) {
            next(error);
        }
    },
    setAdmin: async (req, res, next) => {

        try {
            const updatedUser = await User.findByIdAndUpdate(
                req.params.userId,
                {
                    $set: {
                        isAdmin: true
                    },
                },
                {new: true}
            );

            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);
        }
    },
    signOut: (req, res, next) => {
        try {
            res
                .clearCookie('access_token')
                .status(200)
                .json('Пользователь разлогинен');
        } catch (error) {
            next(error);
        }
    },
}

module.exports = UserController;
