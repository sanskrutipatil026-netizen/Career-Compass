const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");

const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS,
},
});

function createBackendToken(userId) {
return jwt.sign(
{ userId: String(userId) },
process.env.JWT_SECRET,
{
expiresIn: "7d",
issuer: "career-compass-backend",
audience: "career-compass-api",
}
);
}

// SIGNUP
router.post("/signup", async (req, res) => {
try {
const { name, email, password } = req.body;


if (!name || !email || !password) {
  return res.status(400).json({
    success: false,
    message: "All fields are required.",
  });
}

if (password.length < 8) {
  return res.status(400).json({
    success: false,
    message: "Password must be at least 8 characters.",
  });
}

const normalizedEmail = email.trim().toLowerCase();

const existingUser = await User.findOne({
  email: normalizedEmail,
});

if (existingUser) {
  return res.status(400).json({
    success: false,
    message: "Email is already registered.",
  });
}

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({
  name: name.trim(),
  email: normalizedEmail,
  password: hashedPassword,
});

await newUser.save();

return res.status(201).json({
  success: true,
  message: "Signup successful.",
});


} catch (error) {
console.error("Signup error:", error);


return res.status(500).json({
  success: false,
  message: "Server error during signup.",
});


}
});

// EMAIL AND PASSWORD LOGIN
router.post("/login", async (req, res) => {
try {
const { email, password } = req.body;


if (!email || !password) {
  return res.status(400).json({
    success: false,
    message: "Email and password are required.",
  });
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not configured.");

  return res.status(500).json({
    success: false,
    message: "Authentication configuration error.",
  });
}

const normalizedEmail = email.trim().toLowerCase();

const user = await User.findOne({
  email: normalizedEmail,
});

if (!user || !user.password) {
  return res.status(401).json({
    success: false,
    message: "Invalid email or password.",
  });
}

const isPasswordCorrect = await bcrypt.compare(
  password,
  user.password
);

if (!isPasswordCorrect) {
  return res.status(401).json({
    success: false,
    message: "Invalid email or password.",
  });
}

const token = createBackendToken(user._id);

return res.status(200).json({
  success: true,
  message: "Login successful.",
  token,
  user: {
    id: String(user._id),
    name: user.name,
    email: user.email,
  },
});


} catch (error) {
console.error("Login error:", error);


return res.status(500).json({
  success: false,
  message: "Server error during login.",
});


}
});

// GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
try {
const { idToken } = req.body;


if (!idToken) {
  return res.status(400).json({
    success: false,
    message: "Google ID token is required.",
  });
}

console.log("Google Client ID loaded:", !!process.env.GOOGLE_CLIENT_ID);
console.log("JWT Secret loaded:", !!process.env.JWT_SECRET);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
  console.error("Google authentication environment variables are missing.");

  return res.status(500).json({
    success: false,
    message: "Authentication is not configured correctly.",
    missing: {
      googleClientId: !process.env.GOOGLE_CLIENT_ID,
      jwtSecret: !process.env.JWT_SECRET,
    },
  });
}

const ticket = await googleClient.verifyIdToken({
  idToken,
  audience: process.env.GOOGLE_CLIENT_ID,
});

const payload = ticket.getPayload();

if (
  !payload ||
  !payload.email ||
  payload.email_verified !== true
) {
  return res.status(401).json({
    success: false,
    message: "Google account verification failed.",
  });
}

const email = payload.email.trim().toLowerCase();

let user = await User.findOne({ email });

if (!user) {
  user = await User.create({
    name: payload.name || email.split("@")[0],
    email,
    password: null,
  });
}

const token = createBackendToken(user._id);

return res.status(200).json({
  success: true,
  message: "Google login successful.",
  token,
  user: {
    id: String(user._id),
    name: user.name,
    email: user.email,
  },
});


} catch (error) {
console.error("Google login error:", error.message);


return res.status(401).json({
  success: false,
  message: "Google authentication failed.",
});


}
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
try {
const { email } = req.body;


if (!email) {
  return res.status(400).json({
    success: false,
    message: "Email is required.",
  });
}

const normalizedEmail = email.trim().toLowerCase();

const user = await User.findOne({
  email: normalizedEmail,
});

if (!user) {
  return res.status(404).json({
    success: false,
    message: "No account found with this email.",
  });
}

const resetToken = crypto.randomBytes(32).toString("hex");

user.resetPasswordToken = resetToken;
user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

await user.save();

const frontendUrl = (
  process.env.FRONTEND_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: "Career Compass - Reset Your Password",
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #8b6347;">Career Compass</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your Career Compass password.</p>
      <p>Click the button below to create a new password:</p>
      <a href="${resetLink}"
         style="display:inline-block;padding:12px 20px;background-color:#a67b5b;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
        Reset Password
      </a>
      <p>This link will expire in <strong>15 minutes</strong>.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p>Regards,<br />Career Compass Team</p>
    </div>
  `,
});

return res.status(200).json({
  success: true,
  message: "Password reset link sent to your email.",
});


} catch (error) {
console.error("Forgot password error:", error);


return res.status(500).json({
  success: false,
  message: "Unable to send password reset email.",
});


}
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
try {
const { token, password } = req.body;


if (!token || !password) {
  return res.status(400).json({
    success: false,
    message: "Token and password are required.",
  });
}

if (password.length < 8) {
  return res.status(400).json({
    success: false,
    message: "Password must be at least 8 characters.",
  });
}

const user = await User.findOne({
  resetPasswordToken: token,
  resetPasswordExpires: { $gt: new Date() },
});

if (!user) {
  return res.status(400).json({
    success: false,
    message: "Invalid or expired reset link.",
  });
}

user.password = await bcrypt.hash(password, 10);
user.resetPasswordToken = null;
user.resetPasswordExpires = null;

await user.save();

return res.status(200).json({
  success: true,
  message: "Password reset successfully.",
});


} catch (error) {
console.error("Reset password error:", error);


return res.status(500).json({
  success: false,
  message: "Unable to reset password.",
});


}
});

module.exports = router;
