const { sequelize } = require("../db");

// Create a new class
exports.createClass = async (req, res) => {
  const { class_name, board_id } = req.body;
  try {
    const result = await sequelize.query(
      `INSERT INTO Classes (class_name, board_id) VALUES (:class_name, :board_id)`,
      { replacements: { class_name, board_id } }
    );
    const classId = result[0];
    res.json({ message: "Class created successfully", id: classId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await sequelize.query(`SELECT * FROM Classes`, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get classes by parent board_id
exports.getClassesByBoardIds = async (req, res) => {
  const { board_ids } = req.body; // Expecting board_ids as an array
  try {
    if (!Array.isArray(board_ids) || board_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "board_ids must be a non-empty array" });
    }

    const classes = await sequelize.query(
      `SELECT * FROM Classes WHERE board_id IN (:board_ids)`,
      { replacements: { board_ids }, type: sequelize.QueryTypes.SELECT }
    );

    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a class by ID
exports.updateClass = async (req, res) => {
  const { class_id, class_name, board_id } = req.body;
  try {
    const result = await sequelize.query(
      `UPDATE Classes SET class_name = :class_name, board_id = :board_id WHERE class_id = :class_id`,
      { replacements: { class_id, class_name, board_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json({ message: "Class updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a class by ID
exports.deleteClass = async (req, res) => {
  const { class_id } = req.params;
  try {
    const result = await sequelize.query(
      `DELETE FROM Classes WHERE class_id = :class_id`,
      { replacements: { class_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
