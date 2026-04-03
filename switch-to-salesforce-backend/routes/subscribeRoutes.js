const express = require('express');
const { body } = require('express-validator');
const { subscribe } = require('../controllers/subscriberController');

const router = express.Router();

router.post('/', [body('email').isEmail().normalizeEmail()], subscribe);

module.exports = router;
