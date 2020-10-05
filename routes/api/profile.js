const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
const { ContextRunnerImpl } = require('express-validator/src/chain');

//@route   Get api/profile
//@desc    Test route
//@access  Public
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.userP.id,
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res
                .status(400)
                .json({ meg: 'This is no profile for this user' });
        }
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            company,
            location,
            website,
            bio,
            skills,
            status,
            githubusername,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook,
        } = req.body;
        const profileFields = {};
        profileFields.user = req.userP.id;

        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.company = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;

        if (skills) {
            profileFields.skills = skills
                .split(',')
                .map((skill) => skill.trim());
        }

        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.userP.id });
            if (profile) {
                prfile = await Profile.findOneAndUpdate(
                    { user: req.userP.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            //Create
            profile = new Profile(profileFields);
            await profile.save();
            return res.json(profile);
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error');
        }
        // res.json('good');
    }
);

//Get all profile
//public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', [
            'name',
            'avatar',
        ]);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//Get profile by user ID
//private
router.post('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id,
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'no user found' });
        }
        res.json(profile);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'no user found' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//Delete profile and user by token authorization
//private
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.userP.id });

        await User.findOneAndRemove({ _id: req.userP.id });
        res.json({ meg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// PUT route to udpate the experience
// private
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, company, from } = req.body;
        const newExp = { title, company, from };

        try {
            let profile = await Profile.findOne({ user: req.userP.id });
            if (profile) {
                profile.experience.unshift(newExp);
                await profile.save();
                return res.json(profile);
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error');
        }
    }
);
//Delete profile experience by exp_id
//private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.userP.id });
        //this check is no checking againt the exp_id, not useful
        if (!profile) {
            return res.status(400).json({ msg: 'no matching experience' });
        }
        //Get remove index
        const removeIndex = profile.experience
            .map((item) => item.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// PUT route to udpate the education
// private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of study is required').not().isEmpty(),
            check('from', 'From is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { school, degree, from, fieldofstudy } = req.body;
        const newEdu = { school, degree, from, fieldofstudy };

        try {
            let profile = await Profile.findOne({ user: req.userP.id });
            if (profile) {
                profile.education.unshift(newEdu);
                await profile.save();
                return res.json(profile);
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error');
        }
    }
);

//Delete profile education by token authorization
//private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.userP.id });

        //Get remove index
        const removeIndex = profile.education
            .map((item) => item.id)
            .indexOf(req.params.edu_id);
        if (removeIndex < 0) {
            return res.status(400).json({ msg: 'No matching education' });
        }
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route    GET api/profile/github/:username
//@desc     get github user repo
//@access   Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&so=created:asc&client_id=${config.get(
                'githubClientId'
            )}&client_securt=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' },
        };
        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No Github profile found' });
            }
            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send('Server Error');
    }
});
module.exports = router;
