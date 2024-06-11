const Post = require('../models/post.model.js');
const errorHandler = require('../utils/error.js');

const PostController = {
    create: async (req, res, next) => {
        if (!req.user.isAdmin) {
            return next(errorHandler(403, 'У вас нет прав'));
        }
        if (!req.body.title || !req.body.content) {
            return next(errorHandler(400, 'Заполните все поля'));
        }
        const slug = req.body.title
            .split(' ')
            .join('-')
            .toLowerCase()
            .replace(/[^a-zA-Z0-9-]/g, '');
        const newPost = new Post({
            ...req.body,
            slug,
            userId: req.user.id,
        });
        try {
            const savedPost = await newPost.save();
            res.status(201).json(savedPost);
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 9;
            const sortDirection = req.query.order === 'asc' ? 1 : -1;
            const posts = await Post.find({
                ...(req.query.userId && {userId: req.query.userId}),
                ...(req.query.category && {category: req.query.category}),
                ...(req.query.slug && {slug: req.query.slug}),
                ...(req.query.postId && {_id: req.query.postId}),
                ...(req.query.searchTerm && {
                    $or: [
                        {title: {$regex: req.query.searchTerm, $options: 'i'}},
                        {content: {$regex: req.query.searchTerm, $options: 'i'}},
                    ],
                }),
            })
                .sort({updatedAt: sortDirection})
                .skip(startIndex)
                .limit(limit);

            const totalPosts = await Post.countDocuments();

            const now = new Date();

            const oneMonthAgo = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate()
            );

            const lastMonthPosts = await Post.countDocuments({
                createdAt: {$gte: oneMonthAgo},
            });

            console.log(posts)

            res.status(200).json({
                posts,
                totalPosts,
                lastMonthPosts,
            });
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        const postId = req.params.postId;

        if (!req.user.isAdmin || req.user.id !== req.params.userId) {
            return next(errorHandler(403, 'У вас нет прав'));
        }
        try {
            await Post.findByIdAndDelete(postId);
            res.status(200).json('Пост удален');
        } catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        const postId = req.params.postId;

        if (!req.user.isAdmin || req.user.id !== req.params.userId) {
            return next(errorHandler(403, 'У вас нет прав'));
        }
        try {
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                {
                    $set: {
                        title: req.body.title,
                        content: req.body.content,
                        category: req.body.category,
                        image: req.body.image,
                    },
                },
                {new: true}
            );
            res.status(200).json(updatedPost);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = PostController;
