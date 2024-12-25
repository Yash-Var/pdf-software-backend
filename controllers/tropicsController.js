const { sequelize } = require("../db");

// Create a new tropic
exports.createTropic = async (req, res) => {
  const { tropic_name, chapter_id } = req.body;
  try {
    const result = await sequelize.query(
      `INSERT INTO Tropics (tropic_name, chapter_id) VALUES (:tropic_name, :chapter_id)`,
      { replacements: { tropic_name, chapter_id } }
    );
    const tropicId = result[0];
    res.json({ message: "Tropic created successfully", id: tropicId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tropics
exports.getTropics = async (req, res) => {
  try {
    const tropics = await sequelize.query(`SELECT * FROM Tropics`, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(tropics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tropics by multiple chapter_ids
exports.getTropicsByChapterIds = async (req, res) => {
  const { chapter_ids } = req.body; // Expecting chapter_ids as an array
  try {
    if (!Array.isArray(chapter_ids) || chapter_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "chapter_ids must be a non-empty array" });
    }

    const tropics = await sequelize.query(
      `SELECT * FROM Tropics WHERE chapter_id IN (:chapter_ids)`,
      { replacements: { chapter_ids }, type: sequelize.QueryTypes.SELECT }
    );

    res.json(tropics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a tropic by ID
exports.updateTropic = async (req, res) => {
  const { tropic_id, tropic_name, chapter_id } = req.body;
  try {
    const result = await sequelize.query(
      `UPDATE Tropics SET tropic_name = :tropic_name, chapter_id = :chapter_id WHERE tropic_id = :tropic_id`,
      { replacements: { tropic_id, tropic_name, chapter_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Tropic not found" });
    }
    res.json({ message: "Tropic updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a tropic by ID
exports.deleteTropic = async (req, res) => {
  const { tropic_id } = req.params;
  try {
    const result = await sequelize.query(
      `DELETE FROM Tropics WHERE tropic_id = :tropic_id`,
      { replacements: { tropic_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Tropic not found" });
    }
    res.json({ message: "Tropic deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
