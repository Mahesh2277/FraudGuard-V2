const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key-here',
    { expiresIn: '24h' }
  );
};

exports.registerUser = async function(req, res) {
  try {
    const { email, name, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Create new user (password will be hashed by the pre-save hook)
    const user = await userModel.create({
      email,
      name,
      password,
      role: role || 'user' // Default to 'user' if not specified
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration"
    });
  }
};

exports.loginUser = async function(req, res) {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect credentials"
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
};

exports.logout = async function(req, res) {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

// Get current user (protected route)
exports.getCurrentUser = async function(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Get current user error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

