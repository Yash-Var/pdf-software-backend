const jwt = require("jsonwebtoken");
const { sequelize } = require("../db");

const JWT_SECRET = "your_secret_key";

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

exports.authorize = (roles) => (req, res, next) => {
  const { type } = req.user;
  console.log(type);
  if (!roles.includes(type)) {
    return res
      .status(403)
      .json({ message: "Forbidden. You don't have permission." });
  }

  next();
};
