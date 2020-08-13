const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route   Get api/profile
//@desc    Test route
//@access  Public
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.userP.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ meg: 'This is no profile for this user' });
        }
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
