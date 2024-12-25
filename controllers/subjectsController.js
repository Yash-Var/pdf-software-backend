const { sequelize } = require("../db");

// Create a new subject
exports.createSubject = async (req, res) => {
  const { subject_name, class_id } = req.body;
  try {
    const result = await sequelize.query(
      `INSERT INTO Subjects (subject_name, class_id) VALUES (:subject_name, :class_id)`,
      { replacements: { subject_name, class_id } }
    );
    const subjectId = result[0];
    res.json({ message: "Subject created successfully", id: subjectId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await sequelize.query(`SELECT * FROM Subjects`, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subjects by multiple class_id values
exports.getSubjectsByClassIds = async (req, res) => {
  const { class_ids } = req.body; // Expecting class_ids as an array
  try {
    if (!Array.isArray(class_ids) || class_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "class_ids must be a non-empty array" });
    }

    const subjects = await sequelize.query(
      `SELECT * FROM Subjects WHERE class_id IN (:class_ids)`,
      { replacements: { class_ids }, type: sequelize.QueryTypes.SELECT }
    );

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subject by ID
exports.updateSubject = async (req, res) => {
  const { subject_id, subject_name, class_id } = req.body;
  try {
    const result = await sequelize.query(
      `UPDATE Subjects SET subject_name = :subject_name, class_id = :class_id WHERE subject_id = :subject_id`,
      { replacements: { subject_id, subject_name, class_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json({ message: "Subject updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a subject by ID
exports.deleteSubject = async (req, res) => {
  const { subject_id } = req.params;
  try {
    const result = await sequelize.query(
      `DELETE FROM Subjects WHERE subject_id = :subject_id`,
      { replacements: { subject_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
