const express = require('express');
const AuthController = require("../controllers/auth.controller");
const verifyToken = require("../utils/verifyUser");
const CommentController = require("../controllers/comment.controller");
const PostController = require("../controllers/post.controller");
const UserController = require("../controllers/user.controller");

const router = express.Router();

router.post('/auth/signup', AuthController.signUp);
router.post('/auth/signin', AuthController.signIn);
router.post('/auth/google', AuthController.google)

router.post('/comment/create', verifyToken, CommentController.create);
router.get('/comment/getPostComments/:postId', CommentController.getById);
router.put('/comment/likeComment/:commentId', verifyToken, CommentController.like);
router.put('/comment/editComment/:commentId', verifyToken, CommentController.edit);
router.delete('/comment/deleteComment/:commentId', verifyToken, CommentController.delete);
router.get('/comment/getcomments', verifyToken, CommentController.getAll);

router.post('/post/create', verifyToken, PostController.create)
router.get('/post/getposts', PostController.getAll)
router.delete('/post/deletepost/:postId/:userId', verifyToken, PostController.delete)
router.put('/post/updatepost/:postId/:userId', verifyToken, PostController.update)

router.put('/user/update/:userId', verifyToken, UserController.update);
router.delete('/user/delete/:userId', verifyToken, UserController.delete);
router.post('/user/signout', UserController.signOut);
router.get('/user/getusers', verifyToken, UserController.getAll);
router.get('/user/:userId', UserController.getById);

router.all('*', (req, res) => {
    res.status(404).json({ message: 'Страница не найдена' });
});

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// });


module.exports = router;