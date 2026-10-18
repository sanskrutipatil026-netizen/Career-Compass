const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports = function authenticateToken(req, res, next) {
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
return res.status(401).json({
success: false,
message: "Authentication required. Please log in.",
});
}

const token = authHeader.slice(7).trim();

if (!token || !process.env.JWT_SECRET) {
return res.status(401).json({
success: false,
message: "Invalid authentication token.",
});
}

try {
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
issuer: "career-compass-backend",
audience: "career-compass-api",
});


if (
  typeof decoded.userId !== "string" ||
  !mongoose.Types.ObjectId.isValid(decoded.userId)
) {
  return res.status(401).json({
    success: false,
    message: "Invalid authentication token.",
  });
}

req.user = {
  id: decoded.userId,
};

return next();


} catch (error) {
return res.status(401).json({
success: false,
message: "Invalid or expired authentication token.",
});
}
};
