const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');
//@route   Get api/auth
//@desc    Test route
//@access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userP.id).select('-password');
        res.json(user);
        console.log(req);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
