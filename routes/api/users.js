const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route   POST api/users
//@desc    Test route
//@access  Public
router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Plese enter a valid email').isEmail(),
        check('password', 'Please enter a password moe than 6 characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        try {
            // See if user exist
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exist' }] });
            }

            //Get users gravartar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm',
            });
            user = new User({
                name,
                email,
                avatar,
                password,
            });
            //Encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();
            //Return jasonwebtoken
            const payload = {
                user: {
                    id: user.id,
                },
            };
            jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
