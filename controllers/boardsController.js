const { sequelize } = require("../db");

// Create a new board
exports.createBoard = async (req, res) => {
  const { Board_name } = req.body;
  try {
    const result = await sequelize.query(
      `INSERT INTO Boards (Board_name) VALUES (:Board_name)`,
      { replacements: { Board_name } }
    );
    const boardId = result[0];
    res.json({ message: "Board created successfully", id: boardId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all boards
exports.getBoards = async (req, res) => {
  try {
    const boards = await sequelize.query(`SELECT * FROM Boards`, {
      type: sequelize.QueryTypes.SELECT,
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a board by ID
exports.updateBoard = async (req, res) => {
  const { board_id, Board_name } = req.body;
  try {
    const result = await sequelize.query(
      `UPDATE Boards SET Board_name = :Board_name WHERE board_id = :board_id`,
      { replacements: { board_id, Board_name } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.json({ message: "Board updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a board by ID
exports.deleteBoard = async (req, res) => {
  const { board_id } = req.params;
  try {
    const result = await sequelize.query(
      `DELETE FROM Boards WHERE board_id = :board_id`,
      { replacements: { board_id } }
    );
    if (result[0] === 0) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
