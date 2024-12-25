const express = require("express");
const {
  registerUser,
  loginUser,
  getUserDetails,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
// Only SUPER ADMIN can register users
router.post(
  "/register",
  authenticate,
  authorize(["SUPER ADMIN"]),
  registerUser
);

router.post("/login", loginUser);

// Protected Routes
router.get("/me", authenticate, getUserDetails);
router.put("/update/:id", authenticate, authorize(["SUPER ADMIN"]), updateUser);
router.delete(
  "/delete/:id",
  authenticate,
  authorize(["SUPER ADMIN"]),
  deleteUser
);

module.exports = router;
