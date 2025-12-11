const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, phone, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    // generate username: try firstname+lastname, if exists append number
    let base = (firstName + lastName).toLowerCase().replace(/\s+/g,'');
    let username = base;
    let i = 0;
    while (await User.findOne({ username })) {
      i++;
      username = `${base}${i}`;
    }

    const user = new User({ firstName, lastName, dateOfBirth, phone, email, password, username });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret');
    res.json({ token, user: { id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret');
    res.json({ token, user: { id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Search by username
router.get('/search', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'username query required' });
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ id: user._id, username: user.username, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;