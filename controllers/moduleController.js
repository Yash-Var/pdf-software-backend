const { sequelize } = require("../db");
const { QueryTypes } = require("sequelize");

// Get all modules
exports.getAllModules = async (req, res) => {
  try {
    const modules = await sequelize.query("SELECT * FROM Modules", {
      type: QueryTypes.SELECT,
    });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching modules.", error });
  }
};

// Get a specific module by ID
exports.getModuleById = async (req, res) => {
  const { id } = req.params;
  try {
    const module = await sequelize.query(
      "SELECT * FROM Modules WHERE module_id = ?",
      {
        type: QueryTypes.SELECT,
        replacements: [id],
      }
    );

    if (module.length === 0) {
      return res.status(404).json({ message: "Module not found." });
    }

    res.json(module[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching the module.", error });
  }
};

// Create a new module
exports.createModule = async (req, res) => {
  const {
    Module_name,
    class_id,
    board_id,
    Chapter_id,
    Tropic_id,
    difficulty_level,
    subject_id,
  } = req.body;

  try {
    const [result] = await sequelize.query(
      `INSERT INTO Modules (Module_name, class_id, board_id, Chapter_id, Tropic_id, difficulty_level, subject_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          Module_name,
          class_id,
          board_id,
          Chapter_id,
          Tropic_id,
          difficulty_level,
          subject_id,
        ],
      }
    );

    res.status(201).json({
      message: "Module created successfully.",
      module_id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating the module.", error });
  }
};

// Update an existing module
exports.updateModule = async (req, res) => {
  const { id } = req.params;
  const {
    Module_name,
    class_id,
    board_id,
    Chapter_id,
    Tropic_id,
    difficulty_level,
    subject_id,
  } = req.body;

  try {
    const [result] = await sequelize.query(
      `UPDATE Modules 
       SET Module_name = ?, class_id = ?, board_id = ?, Chapter_id = ?, Tropic_id = ?, difficulty_level = ?, subject_id = ?
       WHERE module_id = ?`,
      {
        replacements: [
          Module_name,
          class_id,
          board_id,
          Chapter_id,
          Tropic_id,
          difficulty_level,
          subject_id,
          id,
        ],
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Module not found." });
    }

    res.json({ message: "Module updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error updating the module.", error });
  }
};

// Delete a module
exports.deleteModule = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await sequelize.query(
      "DELETE FROM Modules WHERE module_id = ?",
      { replacements: [id] }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Module not found." });
    }

    res.json({ message: "Module deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting the module.", error });
  }
};
