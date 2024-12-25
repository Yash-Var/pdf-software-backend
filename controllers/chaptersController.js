const { sequelize } = require("../db");

// Create a new chapter
exports.createChapter = async (req, res) => {
  const { chapter_name, subject_id } = req.body;
  try {
    const result = await sequelize.query(
      `INSERT INTO Chapters (chapter_name, subject_id) VALUES (:chapter_name, :subject_id)`,
      { replacements: { chapter_name, subject_id } }
    );
    const chapterId = result[0];
    res.json({ message: "Chapter created successfully", id: chapterId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all chapters
exports.getChapters = async (req, res) => {
  try {
    const chapters = await sequelize.query(`SELECT * FROM Chapters`, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chapters by multiple subject_ids
exports.getChaptersBySubjectIds = async (req, res) => {
  const { subject_ids } = req.body; // Expecting subject_ids as an array
  try {
    if (!Array.isArray(subject_ids) || subject_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "subject_ids must be a non-empty array" });
    }

    const chapters = await sequelize.query(
      `SELECT * FROM Chapters WHERE subject_id IN (:subject_ids)`,
      { replacements: { subject_ids }, type: sequelize.QueryTypes.SELECT }
    );

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a chapter by ID
exports.updateChapter = async (req, res) => {
  const { chapter_id, chapter_name, subject_id } = req.body;
  try {
    const result = await sequelize.query(
      `UPDATE Chapters SET chapter_name = :chapter_name, subject_id = :subject_id WHERE chapter_id = :chapter_id`,
      { replacements: { chapter_id, chapter_name, subject_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.json({ message: "Chapter updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a chapter by ID
exports.deleteChapter = async (req, res) => {
  const { chapter_id } = req.params;
  try {
    const result = await sequelize.query(
      `DELETE FROM Chapters WHERE chapter_id = :chapter_id`,
      { replacements: { chapter_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
