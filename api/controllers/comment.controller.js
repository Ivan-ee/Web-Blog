const Comment = require('../models/comment.model.js');

const CommentController = {
    create: async (req, res, next) => {
        try {
            const {content, postId, userId} = req.body;

            if (userId !== req.user.id) {
                return next(
                    errorHandler(403, 'У вас нет прав')
                );
            }

            const newComment = new Comment({
                content,
                postId,
                userId,
            });
            await newComment.save();

            res.status(200).json(newComment);
        } catch (e) {
            console.error(e);
            res.status(500).json({error: e});
        }
    },
    getById: async (req, res, next) => {
        try {
            const comments = await Comment.find({postId: req.params.postId}).sort({
                createdAt: -1,
            });
            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    },
    like: async (req, res, next) => {
        try {
            const comment = await Comment.findById(req.params.commentId);
            if (!comment) {
                return next(errorHandler(404, 'Комментарий не найден'));
            }
            const userIndex = comment.likes.indexOf(req.user.id);
            if (userIndex === -1) {
                comment.numberOfLikes += 1;
                comment.likes.push(req.user.id);
            } else {
                comment.numberOfLikes -= 1;
                comment.likes.splice(userIndex, 1);
            }
            await comment.save();
            res.status(200).json(comment);
        } catch (error) {
            next(error);
        }
    },
    edit: async (req, res, next) => {
        try {
            const comment = await Comment.findById(req.params.commentId);
            if (!comment) {
                return next(errorHandler(404, 'Комментарий не найден'));
            }
            if (comment.userId !== req.user.id && !req.user.isAdmin) {
                return next(
                    errorHandler(403, 'У вас нет прав')
                );
            }

            const editedComment = await Comment.findByIdAndUpdate(
                req.params.commentId,
                {
                    content: req.body.content,
                },
                {new: true}
            );
            res.status(200).json(editedComment);
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const comment = await Comment.findById(req.params.commentId);
            if (!comment) {
                return next(errorHandler(404, 'Комментарий не найден'));
            }
            if (comment.userId !== req.user.id && !req.user.isAdmin) {
                return next(
                    errorHandler(403, 'У вас нет прав')
                );
            }
            await Comment.findByIdAndDelete(req.params.commentId);
            res.status(200).json('Комментарий удален');
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        if (!req.user.isAdmin)
            return next(errorHandler(403, 'У вас нет прав'));
        try {
            const startIndex = parseInt(req.query.startIndex) || 0;
            const limit = parseInt(req.query.limit) || 9;
            const sortDirection = req.query.sort === 'desc' ? -1 : 1;
            const comments = await Comment.find()
                .sort({createdAt: sortDirection})
                .skip(startIndex)
                .limit(limit);
            const totalComments = await Comment.countDocuments();
            const now = new Date();
            const oneMonthAgo = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate()
            );
            const lastMonthComments = await Comment.countDocuments({
                createdAt: {$gte: oneMonthAgo},
            });
            res.status(200).json({comments, totalComments, lastMonthComments});
        } catch (error) {
            next(error);
        }
    },
}

module.exports = CommentController;