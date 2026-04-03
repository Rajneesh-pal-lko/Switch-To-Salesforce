const { validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');

async function subscribe(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const email = req.body.email.trim().toLowerCase();
    await Subscriber.create({ email });
    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ success: true, message: 'You are already subscribed' });
    }
    next(err);
  }
}

module.exports = { subscribe };
