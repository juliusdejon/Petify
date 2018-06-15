const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');


// Load Input Validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

// Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   GET api/users/users
// @desc    Get users
// @access  Public
router.get('/', (req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));
});

// @route   POST api/users/users
// @desc    Register users
// @access  Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.status(400).json({ email: 'Email already exists' });
      }
      else {
        if (!isValid) {
          return res.status(400).json(errors);
        }
        else {
          const newUser = new User({
            email: req.body.email,
            password: req.body.password,
          });

          // Salting The Password
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;

              // Registration 
              newUser.save()
                .then(user => res.json(user))
                .catch(err => console.log(err));
            })
          })
        }
      }
    })
})

// @route   POST api/users/login
// @desc    Login User/ Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  const email = req.body.email;
  const password = req.body.password;

  // Find User by Email
  User.findOne({ email })
    .then(user => {
      // Check for user
      if (!user) {
        return res.status(404).json({ email: 'User not found' });
      }
      if (!isValid) {
        return res.status(400).json(errors);
      }
      // Check Password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // User Matched 
            const payload = { id: user.id, name: user.email } // Create JWT Payload

            // Sign Token
            jwt.sign(
              payload,
              keys.secretOrKey,
              { expiresIn: 3600 },
              (err, token) => {
                res.json({
                  success: true,
                  token: `Bearer ${token}`
                });
              });
          } else {
            return res.status(404).json({ password: 'Password Incorrect' });
          }
        })

    })
})

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email
  });
})


module.exports = router;
