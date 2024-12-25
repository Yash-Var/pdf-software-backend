const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../db");

// Secret for JWT
const JWT_SECRET = "your_secret_key";

// Register User
// Register User (Only SUPER ADMIN)
exports.registerUser = async (req, res) => {
  const { username, password, type } = req.body;

  if (!username || !password || !type) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    await sequelize.query(
      `INSERT INTO Users (username, password, type) VALUES (:username, :password, :type)`,
      {
        replacements: { username, password: hashedPassword, type },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle unique constraint violation
    if (error.original && error.original.errno === 1062) {
      return res.status(400).json({ message: "Username already exists." });
    }

    res
      .status(500)
      .json({ message: "Error registering user.", error: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Fetch user from the database
    const [user] = await sequelize.query(
      `SELECT * FROM Users WHERE username = :username AND is_active = 1`,
      {
        replacements: { username },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found or inactive." });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res
      .status(500)
      .json({ message: "Error logging in user.", error: error.message });
  }
};

// Fetch User Details
exports.getUserDetails = async (req, res) => {
  const { id } = req.user;

  try {
    const [user] = await sequelize.query(
      `SELECT id, username, type, is_active, created_at, updated_at 
       FROM Users WHERE id = :id AND is_active = 1`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "Error fetching user details.", error: error.message });
  }
};

// Update User (Admin only)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, type, is_active } = req.body;

  // Validate input: Ensure at least one field is provided
  if (username === undefined && type === undefined && is_active === undefined) {
    return res.status(400).json({ message: "No fields to update." });
  }

  try {
    // Default undefined fields to null for proper SQL handling
    const replacements = {
      id,
      username: username !== undefined ? username : null,
      type: type !== undefined ? type : null,
      is_active: is_active !== undefined ? is_active : null,
    };

    // Perform the update query
    const [result] = await sequelize.query(
      `UPDATE Users 
         SET 
           username = COALESCE(:username, username), 
           type = COALESCE(:type, type), 
           is_active = COALESCE(:is_active, is_active)
         WHERE id = :id`,
      {
        replacements,
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Check if any rows were updated
    if (result === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made." });
    }

    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Error updating user.", error: error.message });
  }
};

// Delete User (Admin only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await sequelize.query(`DELETE FROM Users WHERE id = :id`, {
      replacements: { id },
      type: sequelize.QueryTypes.DELETE,
    });

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Error deleting user.", error: error.message });
  }
};
