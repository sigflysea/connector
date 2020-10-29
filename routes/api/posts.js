const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { text, json } = require('express');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { findById } = require('../../models/Post');

//@route   Get api/posts
//@desc    Get all posts
//@access  private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//@route   Post api/posts/:user_id
//@desc    Get post by User ID
//@access  Private/////?????????????? not working  ????????
router.post('/:user_id', async (req, res) => {
    try {
        const post = await Post.findOne({
            user: req.params.user_id,
        }).populate('user', ['name', 'avatar']); //wrong using 'name' as first cause error, but in profile it didn't cause error????
        if (!post) {
            return res.status(400).json({ msg: 'no user found' });
        }
        return res.json(post);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'no00000 user found' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
//@route   Post api/posts
//@desc    Create a post
//@access  Private
router.post(
    '/',
    [auth, check('text', 'Please enter your post').not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array() });
        }

        try {
            const user = await User.findById(req.userP.id).select('-password');
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.userP.id,
            });
            const oneP = await newPost.save();
            return res.json(oneP);
        } catch (error) {
            console.error(error.message);
            return res.status(500).send('Server Error');
        }
    }
);
//@route   Get api/posts/:post_id
//@desc    post  by post ID
//@access  Private
router.get('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({ msg: 'no post found' });
        }
        res.json(post);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'no post found' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route   Delete api/posts/:post_id
//@desc    Delete post by post ID
//@access  Private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({ msg: 'no post found' });
        }
        if (post.user.toString() !== req.userP.id) {
            return res.status(401).json({ msg: 'not authorized' });
        }

        post.remove();
        return res.json(post);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'no post found' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
//@route   put api/posts/like/:post_id
//@desc    Like post by post ID
//@access  Private
router.put('/like/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({ msg: 'no post found' });
        }
        if (
            post.likes.filter((like) => like.user.toString() === req.userP.id)
                .length > 0
        ) {
            return res.status(400).json({ meg: 'already liked' });
        }

        post.likes.unshift({ user: req.userP.id });
        await post.save();
        return res.json(post.likes);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'no post found' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
//@route   put api/posts/unlike/:post_id
//@desc    UnLike post by post ID
//@access  Private
router.put('/unlike/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({ msg: 'no post found' });
        } //probably no need, since is req should come from the post
        if (
            post.likes.filter((like) => like.user.toString() === req.userP.id)
                .length === 0
        ) {
            return res.status(400).json({ meg: 'have not liked' });
        }
        const removeIndex = post.likes
            .map((like) => like.toString())
            .indexOf(req.userP.id);

        post.likes.splice(removeIndex, 1);
        await post.save();
        return res.json(post.likes);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'no post found' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
//@route post api/posts/comment/:post_id
//@Des   post comments
//@private
router.post(
    '/comment/:post_id',
    [auth, check('text', 'please input comments').not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await User.findById(req.userP.id).select('-password');
            const post = await Post.findById(req.params.post_id);

            const comment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.userP.id,
            };
            post.comments.unshift(comment);
            await post.save();
            return res.json(post.comments);
        } catch (error) {
            if (error.kind == 'ObjectId') {
                return res.status(400).json({ meg: 'no post found' });
            }
            console.error(error.message);
            return res.status(500).json('Server Error');
        }
    }
);
//@route delete api/posts/comment/:id/:comment_id
//@Des   delete comments
//@private
router.delete('/comment/:id/:c_id', auth, async (req, res) => {
    try {
        //  const user = await User.findById(req.userP.id).select('-password');
        const post = await Post.findById(req.params.id);

        const comment1 = post.comments.find(
            (comt) => comt.id === req.params.c_id
        );
        if (!comment1) {
            return res.status(404).json('no comment found');
        }
        if (comment1.user.toString() !== req.userP.id) {
            return res.status(401).json('not authorized');
        }
        const removeIndex = post.comments
            .map((comment) => comment.id)
            .indexOf(req.params.c_id);

        post.comments.splice(removeIndex, 1);
        await post.save();
        return res.json(post.comments);
    } catch (error) {
        if (error.kind == 'ObjectId') {
            return res.status(400).json({ meg: 'no post found' });
        }
        console.error(error.message);
        return res.status(500).json('Server Error');
    }
});
module.exports = router;
