const { sequelize } = require("../db");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."));
  }
};
const upload = multer({ storage, fileFilter });
// Insert question, question type, and answers simultaneously
exports.createQuestion = async (req, res) => {
  const {
    topic_id,
    question_text,
    type,
    difficulty_level,
    marks,
    options,
    answer,
    isAnswer,
    board_id,
    class_id,
    subject_id,
    chapter_id,
    tropic_id,
  } = req.body;

  const transaction = await sequelize.transaction();
  try {
    // Begin a transaction

    // Insert the question
    const questionResult = await sequelize.query(
      `INSERT INTO Questions 
       (topic_id, question_text, type, difficulty_level, marks, isAnswer, board_id, class_id, subject_id, chapter_id, tropic_id) 
       VALUES 
       (:topic_id, :question_text, :type, :difficulty_level, :marks, :isAnswer, :board_id, :class_id, :subject_id, :chapter_id, :tropic_id)`,
      {
        replacements: {
          topic_id,
          question_text,
          type,
          difficulty_level,
          marks,
          isAnswer,
          board_id,
          class_id,
          subject_id,
          chapter_id,
          tropic_id,
        },
        transaction,
      }
    );

    const question_id = questionResult[0];

    if (options && Array.isArray(options)) {
      const optionPromises = options.map((opt) =>
        sequelize.query(
          `INSERT INTO Question_Options (question_id, option_text, option_type, option_value) 
           VALUES (:question_id, :option_text, :option_type, :option_value)`,
          {
            replacements: {
              question_id,
              option_text: opt.text,
              option_type: opt.type,
              option_value: opt.value || null,
            },
            transaction,
          }
        )
      );
      await Promise.all(optionPromises);
    }

    // Insert answer based on question type
    if (type === "Subjective" && typeof answer === "string") {
      await sequelize.query(
        `INSERT INTO Answers (question_id, answer_text) 
         VALUES (:question_id, :answer_text)`,
        {
          replacements: { question_id, answer_text: answer },
          transaction,
        }
      );
    } else if (type === "Objective" && typeof answer === "string") {
      await sequelize.query(
        `INSERT INTO Answers (question_id, answer_text, is_correct) 
         VALUES (:question_id, :answer_text, 1)`,
        {
          replacements: { question_id, answer_text: answer },
          transaction,
        }
      );
    } else if (type === "Match" && typeof answer === "object") {
      const matchedPair = JSON.stringify(answer);
      await sequelize.query(
        `INSERT INTO Answers (question_id, matched_pair) 
         VALUES (:question_id, :matched_pair)`,
        {
          replacements: { question_id, matched_pair: matchedPair },
          transaction,
        }
      );
    } else if (type === "Assertion" && typeof answer === "string") {
      await sequelize.query(
        `INSERT INTO Answers (question_id, response_code) 
         VALUES (:question_id, :response_code)`,
        {
          replacements: { question_id, response_code: answer },
          transaction,
        }
      );
    }

    await transaction.commit();

    res.json({ message: "Question created successfully", question_id });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};
exports.fetchQuestions = async (req, res) => {
  try {
    const {
      board_id,
      class_id,
      subject_id,
      chapter_id,
      tropic_id,
      type,
      difficulty_level,
      isAnswer,
      question_text, // New field for searching by question text
    } = req.body;

    // Build dynamic query conditions
    let whereConditions = [];
    if (board_id) whereConditions.push(`q.board_id = ${board_id}`);
    if (class_id) whereConditions.push(`q.class_id = ${class_id}`);
    if (subject_id) whereConditions.push(`q.subject_id = ${subject_id}`);
    if (chapter_id) whereConditions.push(`q.chapter_id = ${chapter_id}`);
    if (tropic_id) whereConditions.push(`q.tropic_id = ${tropic_id}`);
    if (type) whereConditions.push(`q.type = '${type}'`);
    if (difficulty_level)
      whereConditions.push(`q.difficulty_level = '${difficulty_level}'`);
    if (isAnswer !== undefined)
      whereConditions.push(`q.isAnswer = ${isAnswer}`);
    if (question_text)
      whereConditions.push(`q.question_text LIKE '${question_text}%'`);

    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    // Query to fetch questions, options, and answers
    const query = `
        SELECT 
          q.question_id, q.topic_id, q.question_text, q.type, q.difficulty_level, q.marks, q.created_at, q.photo,
          q.board_id, q.class_id, q.subject_id, q.chapter_id, q.tropic_id,q.isAnswer,
          qo.option_id, qo.option_text, qo.option_type, qo.option_value,
          a.answer_id, a.answer_text, a.is_correct, a.matched_pair, a.response_code
        FROM Questions q
        LEFT JOIN Question_Options qo ON q.question_id = qo.question_id
        LEFT JOIN Answers a ON q.question_id = a.question_id
        ${whereClause} where q.active=1
      `;

    const questions = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for the given criteria." });
    }

    // Format the data
    const formattedQuestions = questions.reduce((acc, question) => {
      const existingQuestion = acc.find(
        (q) => q.question_id === question.question_id
      );

      const option = {
        option_id: question.option_id,
        option_text: question.option_text,
        option_type: question.option_type,
        option_value: question.option_value,
      };

      if (existingQuestion) {
        if (option.option_id) {
          existingQuestion.options.push(option);
        }
      } else {
        acc.push({
          question_id: question.question_id,
          topic_id: question.topic_id,
          question_text: question.question_text,
          type: question.type,
          difficulty_level: question.difficulty_level,
          marks: question.marks,
          created_at: question.created_at,
          photo: question.photo,
          board_id: question.board_id,
          class_id: question.class_id,
          subject_id: question.subject_id,
          chapter_id: question.chapter_id,
          tropic_id: question.tropic_id,
          isAnswer: question.isAnswer,
          options: option.option_id ? [option] : [],
          answer: {
            answer_id: question.answer_id,
            answer_text: question.answer_text,
            is_correct: question.is_correct,
            matched_pair: question.matched_pair
              ? JSON.parse(question.matched_pair)
              : null,
            response_code: question.response_code,
          },
        });
      }

      return acc;
    }, []);

    res.status(200).json({
      message: "Questions fetched successfully.",
      data: formattedQuestions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res
      .status(500)
      .json({ message: "Error fetching questions.", error: error.message });
  }
};
exports.uploadPhoto = async (req, res) => {
  const { question_id } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photoPath = req.file.path;
    console.log(photoPath);

    // Update the question record with the photo path
    const result = await sequelize.query(
      `UPDATE Questions SET photo = :photo WHERE question_id = :question_id`,
      {
        replacements: { photo: photoPath, question_id },
      }
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Photo uploaded successfully",
      photoPath,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.uploadMiddleware = upload.single("photo");

exports.updateQuestion = async (req, res) => {
  const { question_id } = req.body;
  const updates = req.body; // The updated fields
  const { options, answer, ...questionUpdates } = updates;

  try {
    // Begin a transaction
    const transaction = await sequelize.transaction();

    // Update the question
    if (Object.keys(questionUpdates).length > 0) {
      await sequelize.query(
        `UPDATE Questions 
         SET ${Object.keys(questionUpdates)
           .map((key) => `${key} = :${key}`)
           .join(", ")} 
         WHERE question_id = :question_id`,
        {
          replacements: { ...questionUpdates, question_id },
          transaction,
        }
      );
    }

    // Update options if provided
    if (options && Array.isArray(options)) {
      for (const option of options) {
        if (option.option_id) {
          // Update existing option
          await sequelize.query(
            `UPDATE Question_Options 
             SET option_text = :option_text, option_type = :option_type, option_value = :option_value 
             WHERE option_id = :option_id`,
            {
              replacements: {
                option_id: option.option_id,
                option_text: option.text,
                option_type: option.type,
                option_value: option.value || null,
              },
              transaction,
            }
          );
        } else {
          // Insert new option
          await sequelize.query(
            `INSERT INTO Question_Options (question_id, option_text, option_type, option_value) 
             VALUES (:question_id, :option_text, :option_type, :option_value)`,
            {
              replacements: {
                question_id,
                option_text: option.text,
                option_type: option.type,
                option_value: option.value || null,
              },
              transaction,
            }
          );
        }
      }
    }

    // Update answer if provided
    if (answer) {
      if (answer.answer_id) {
        // Update existing answer
        await sequelize.query(
          `UPDATE Answers 
           SET answer_text = :answer_text, is_correct = :is_correct, matched_pair = :matched_pair, response_code = :response_code 
           WHERE answer_id = :answer_id`,
          {
            replacements: {
              answer_id: answer.answer_id,
              answer_text: answer.text || null,
              is_correct: answer.is_correct || null,
              matched_pair: answer.matched_pair
                ? JSON.stringify(answer.matched_pair)
                : null,
              response_code: answer.response_code || null,
            },
            transaction,
          }
        );
      } else {
        // Insert new answer
        await sequelize.query(
          `INSERT INTO Answers (question_id, answer_text, is_correct, matched_pair, response_code) 
           VALUES (:question_id, :answer_text, :is_correct, :matched_pair, :response_code)`,
          {
            replacements: {
              question_id,
              answer_text: answer.text || null,
              is_correct: answer.is_correct || null,
              matched_pair: answer.matched_pair
                ? JSON.stringify(answer.matched_pair)
                : null,
              response_code: answer.response_code || null,
            },
            transaction,
          }
        );
      }
    }

    await transaction.commit();
    res.json({ message: "Question updated successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Delete Question
exports.deleteQuestion = async (req, res) => {
  const { question_id } = req.params;

  try {
    // Begin a transaction
    const transaction = await sequelize.transaction();

    // Delete options associated with the question
    await sequelize.query(
      `DELETE FROM Question_Options WHERE question_id = :question_id`,
      { replacements: { question_id }, transaction }
    );

    // Delete answers associated with the question
    await sequelize.query(
      `DELETE FROM Answers WHERE question_id = :question_id`,
      { replacements: { question_id }, transaction }
    );

    // Delete the question itself
    await sequelize.query(
      `DELETE FROM Questions WHERE question_id = :question_id`,
      { replacements: { question_id }, transaction }
    );

    await transaction.commit();
    res.json({ message: "Question and all related data deleted successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestionStats = async (req, res) => {
  try {
    // Total number of questions
    const [totalQuestions] = await sequelize.query(`
      SELECT COUNT(*) as total_questions 
      FROM Questions
    `);

    // Number of unused questions (active = 0)
    const [unusedQuestions] = await sequelize.query(`
      SELECT COUNT(*) as unused_questions 
      FROM Questions 
      WHERE active = 1
    `);
    const [usedQuestions] = await sequelize.query(`
      SELECT COUNT(*) as used_questions 
      FROM Questions 
      WHERE active = 0
    `);

    // Distribution of questions by type
    const [questionDistribution] = await sequelize.query(`
      SELECT type, COUNT(*) as count 
      FROM Questions 
      GROUP BY type
    `);

    // Number of questions with answers available (isAnswer = 1)
    const [questionsWithAnswers] = await sequelize.query(`
      SELECT COUNT(*) as questions_with_answers 
      FROM Questions 
      WHERE isAnswer = 1
    `);

    res.json({
      message: "Question statistics fetched successfully.",
      data: {
        total_questions: totalQuestions[0]?.total_questions || 0,
        unused_questions: unusedQuestions[0]?.unused_questions || 0,
        used_questions: usedQuestions[0]?.used_questions || 0,
        question_distribution: questionDistribution || [],
        questions_with_answers:
          questionsWithAnswers[0]?.questions_with_answers || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFilteredQuestions = async (req, res) => {
  const {
    board_id,
    class_id,
    subject_id,
    chapter_id,
    tropic_id,
    type,
    difficulty_level,
    isAnswer,
    question_text,
    noOfQuestion,
  } = req.body;

  try {
    // Build dynamic query conditions
    let whereConditions = [];
    if (board_id) whereConditions.push(`q.board_id = ${board_id}`);
    if (class_id) whereConditions.push(`q.class_id = ${class_id}`);
    if (subject_id) whereConditions.push(`q.subject_id = ${subject_id}`);
    if (chapter_id) whereConditions.push(`q.chapter_id = ${chapter_id}`);
    if (tropic_id) whereConditions.push(`q.tropic_id = ${tropic_id}`);
    if (type) whereConditions.push(`q.type = '${type}'`);
    if (difficulty_level)
      whereConditions.push(`q.difficulty_level = '${difficulty_level}'`);
    if (isAnswer !== undefined)
      whereConditions.push(`q.isAnswer = ${isAnswer}`);
    if (question_text)
      whereConditions.push(`q.question_text LIKE '${question_text}%'`);

    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    // Query to fetch questions, options, and answers
    const query = `
      SELECT 
        q.question_id, q.topic_id, q.question_text, q.type, q.difficulty_level, q.marks, q.created_at, q.photo,
        q.board_id, q.class_id, q.subject_id, q.chapter_id, q.tropic_id,q.isAnswer,
        qo.option_id, qo.option_text, qo.option_type, qo.option_value,
        a.answer_id, a.answer_text, a.is_correct, a.matched_pair, a.response_code
      FROM Questions q
      LEFT JOIN Question_Options qo ON q.question_id = qo.question_id
      LEFT JOIN Answers a ON q.question_id = a.question_id
      ${whereClause}
    `;

    const questions = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for the given criteria." });
    }

    // Format the data
    const formattedQuestions = questions.reduce((acc, question) => {
      const existingQuestion = acc.find(
        (q) => q.question_id === question.question_id
      );

      const option = {
        option_id: question.option_id,
        option_text: question.option_text,
        option_type: question.option_type,
        option_value: question.option_value,
      };

      if (existingQuestion) {
        if (option.option_id) {
          existingQuestion.options.push(option);
        }
      } else {
        acc.push({
          question_id: question.question_id,
          topic_id: question.topic_id,
          question_text: question.question_text,
          type: question.type,
          difficulty_level: question.difficulty_level,
          marks: question.marks,
          created_at: question.created_at,
          photo: question.photo,
          board_id: question.board_id,
          class_id: question.class_id,
          subject_id: question.subject_id,
          chapter_id: question.chapter_id,
          tropic_id: question.tropic_id,
          isAnswer: question.isAnswer,
          options: option.option_id ? [option] : [],
          answer: {
            answer_id: question.answer_id,
            answer_text: question.answer_text,
            is_correct: question.is_correct,
            matched_pair: question.matched_pair
              ? JSON.parse(question.matched_pair)
              : null,
            response_code: question.response_code,
          },
        });
      }

      return acc;
    }, []);

    // Randomize and limit questions if needed
    let selectedQuestions;
    if (formattedQuestions.length > noOfQuestion) {
      selectedQuestions = formattedQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, noOfQuestion);
    } else {
      selectedQuestions = formattedQuestions;
    }

    res.status(200).json({
      message: "Filtered questions fetched successfully.",
      data: selectedQuestions,
    });
  } catch (error) {
    console.error("Error fetching filtered questions:", error);
    res.status(500).json({
      message: "Error fetching filtered questions.",
      error: error.message,
    });
  }
};

exports.fetchusedQuestions = async (req, res) => {
  try {
    // Query to fetch questions, options, and answers
    const query = `
        SELECT 
          q.question_id, q.topic_id, q.question_text, q.type, q.difficulty_level, q.marks, q.created_at, q.photo,
          q.board_id, q.class_id, q.subject_id, q.chapter_id, q.tropic_id,q.isAnswer,
          qo.option_id, qo.option_text, qo.option_type, qo.option_value,
          a.answer_id, a.answer_text, a.is_correct, a.matched_pair, a.response_code
        FROM Questions q
        LEFT JOIN Question_Options qo ON q.question_id = qo.question_id
        LEFT JOIN Answers a ON q.question_id = a.question_id
        where q.active=0
      `;

    const questions = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for the given criteria." });
    }

    // Format the data
    const formattedQuestions = questions.reduce((acc, question) => {
      const existingQuestion = acc.find(
        (q) => q.question_id === question.question_id
      );

      const option = {
        option_id: question.option_id,
        option_text: question.option_text,
        option_type: question.option_type,
        option_value: question.option_value,
      };

      if (existingQuestion) {
        if (option.option_id) {
          existingQuestion.options.push(option);
        }
      } else {
        acc.push({
          question_id: question.question_id,
          topic_id: question.topic_id,
          question_text: question.question_text,
          type: question.type,
          difficulty_level: question.difficulty_level,
          marks: question.marks,
          created_at: question.created_at,
          photo: question.photo,
          board_id: question.board_id,
          class_id: question.class_id,
          subject_id: question.subject_id,
          chapter_id: question.chapter_id,
          tropic_id: question.tropic_id,
          isAnswer: question.isAnswer,
          options: option.option_id ? [option] : [],
          answer: {
            answer_id: question.answer_id,
            answer_text: question.answer_text,
            is_correct: question.is_correct,
            matched_pair: question.matched_pair
              ? JSON.parse(question.matched_pair)
              : null,
            response_code: question.response_code,
          },
        });
      }

      return acc;
    }, []);

    res.status(200).json({
      message: "Questions fetched successfully.",
      data: formattedQuestions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res
      .status(500)
      .json({ message: "Error fetching questions.", error: error.message });
  }
};
