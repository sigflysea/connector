const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { text } = require('express');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

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

//@route   Get api/posts/:user_id
//@desc    Get post by User ID
//@access  Private/////?????????????? not working  ????????
router.post('/:user_id', async (req, res) => {
    try {
        const post = await Post.findOne({
            user: req.params.user_id,
        }).populate('name', ['name', 'avatar']);
        // if (!post) {
        //     return res.status(400).json({ msg: 'no user found' });
        // }
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
//@desc    Get post by post ID
//@access  Private
router.post('/:post_id', async (req, res) => {
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
module.exports = router;
