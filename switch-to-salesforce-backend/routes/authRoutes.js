const express = require('express');
const { body } = require('express-validator');
const { login } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().trim().isLength({ min: 6 }),
  ],
  login
);

module.exports = router;
