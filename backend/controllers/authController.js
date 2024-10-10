const User = require('../model/user.model');
const jwt = require('jsonwebtoken');


// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    "#######",
    { expiresIn: '1h' }
  );
};

// Register new user (signup)
const register = async (req, res) => {
  const { username, email, password, role } = req.body;



  try {


    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
      role
    });
    await user.save();

    // Generate JWT token for the new user
    const token = generateToken(user);
    user.token = token;
    await user.save();

    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token for the logged-in user
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login
};
