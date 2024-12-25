const { sequelize } = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadFolder = "uploads/"; // You can change this folder name
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}${ext}`; // Add timestamp to avoid name conflicts
    cb(null, fileName);
  },
});
exports.upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Only images (jpeg, jpg, png, gif) are allowed.");
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
}).single("logo");

exports.createCompleteQuestionPaper = async (req, res) => {
  const { paper, paper_instructions, sections } = req.body;

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Insert Question Paper
    const [paperResult] = await sequelize.query(
      `INSERT INTO Question_Papers 
           (heading, exam_name, class, total_marks, subject_id, exam_date, watermark_text, 
            school_name, total_time, footer_address, footer_contact_info, font_size, 
            watermark_placement, watermark_opacity, watermark_font_size, number_of_pages)
           VALUES 
           (:heading, :exam_name, :class, :total_marks, :subject_id, :exam_date, :watermark_text, 
            :school_name, :total_time, :footer_address, :footer_contact_info, :font_size, 
            :watermark_placement, :watermark_opacity, :watermark_font_size, :number_of_pages)`,
      {
        replacements: {
          heading: paper.heading,
          exam_name: paper.exam_name,
          class: paper.class,
          total_marks: paper.total_marks,
          subject_id: paper.subject_id,
          exam_date: paper.exam_date,
          watermark_text: paper.watermark_text,
          school_name: paper.school_name,
          total_time: paper.total_time,
          footer_address: paper.footer_address,
          footer_contact_info: paper.footer_contact_info,
          font_size: paper.font_size,
          watermark_placement: paper.watermark_placement,
          watermark_opacity: paper.watermark_opacity,
          watermark_font_size: paper.watermark_font_size,
          number_of_pages: paper.number_of_pages,
        },
        transaction,
      }
    );

    const paper_id = paperResult;

    // Insert Paper Instructions
    if (Array.isArray(paper_instructions)) {
      const instructionPromises = paper_instructions.map((instruction, index) =>
        sequelize.query(
          `INSERT INTO Paper_Instructions (paper_id, instruction_text, instruction_order, active) 
               VALUES (:paper_id, :instruction_text, :instruction_order, :active)`,
          {
            replacements: {
              paper_id,
              instruction_text: instruction.instruction_text,
              instruction_order: instruction.instruction_order, // Assuming order starts from 1
              active: 1, // Set active to 1 by default
            },
            transaction,
          }
        )
      );
      await Promise.all(instructionPromises);
    }

    // Insert Sections
    if (Array.isArray(sections)) {
      for (const section of sections) {
        const [sectionResult] = await sequelize.query(
          `INSERT INTO Paper_Sections 
               (paper_id, section_name, marks_per_question, number_of_questions, total_section_marks)
               VALUES 
               (:paper_id, :section_name, :marks_per_question, :number_of_questions, :total_section_marks)`,
          {
            replacements: {
              paper_id,
              section_name: section.section_name,
              marks_per_question: section.marks_per_question,
              number_of_questions: section.number_of_questions,
              total_section_marks: section.total_section_marks,

              section_instruction: section.section_instruction || null,
            },
            transaction,
          }
        );

        const section_id = sectionResult;

        // Insert Section Instructions
        if (Array.isArray(section.instructions)) {
          const sectionInstructionPromises = section.instructions.map(
            (instruction, index) =>
              sequelize.query(
                `INSERT INTO Section_Instructions (section_id, instruction_text, instruction_order, active) 
                   VALUES (:section_id, :instruction_text, :instruction_order, :active)`,
                {
                  replacements: {
                    section_id,
                    instruction_text: instruction.instruction_text,
                    instruction_order: instruction.instruction_order, // Assuming order starts from 1
                    active: 1, // Set active to 1 by default
                  },
                  transaction,
                }
              )
          );
          await Promise.all(sectionInstructionPromises);
        }

        // Insert Section Questions
        if (Array.isArray(section.questions)) {
          const sectionQuestionPromises = section.questions.map((question_id) =>
            sequelize.query(
              `INSERT INTO Section_Questions (section_id, question_id) 
                   VALUES (:section_id, :question_id)`,
              {
                replacements: { section_id, question_id },
                transaction,
              }
            )
          );
          await Promise.all(sectionQuestionPromises);

          // After inserting section questions, mark these questions as inactive in the Questions table
          const questionIds = section.questions;

          const updateQuestionsPromises = questionIds.map((question_id) =>
            sequelize.query(
              `UPDATE Questions SET active = 0 WHERE question_id = :question_id`,
              {
                replacements: { question_id },
                transaction,
              }
            )
          );
          await Promise.all(updateQuestionsPromises);
        }
      }
    }

    // Commit the transaction
    await transaction.commit();
    res
      .status(201)
      .json({ message: "Question paper created successfully", paper_id });
  } catch (error) {
    console.error("Error creating question paper:", error);
    await transaction.rollback();
    res
      .status(500)
      .json({ message: "Error creating question paper", error: error.message });
  }
};

exports.getQuestionPaperDetails = async (req, res) => {
  const { paper_id } = req.params; // Get paper_id from URL params

  try {
    // Fetch Question Paper details
    const [paper] = await sequelize.query(
      `SELECT * FROM Question_Papers WHERE paper_id = :paper_id AND active = 1`,
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!paper) {
      return res.status(404).json({ message: "Question paper not found." });
    }

    // Fetch Paper Instructions
    const paperInstructions = await sequelize.query(
      `SELECT * FROM Paper_Instructions WHERE paper_id = :paper_id AND active = 1 ORDER BY instruction_order`,
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Fetch Sections for the Question Paper
    const sections = await sequelize.query(
      `SELECT * FROM Paper_Sections WHERE paper_id = :paper_id AND active = 1`,
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Fetch Section Instructions and Questions for each section
    for (const section of sections) {
      // Fetch Section Instructions
      section.section_instructions = await sequelize.query(
        `SELECT * FROM Section_Instructions WHERE section_id = :section_id AND active = 1 ORDER BY instruction_order`,
        {
          replacements: { section_id: section.section_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // Fetch Questions for the Section (including options and answers)
      section.questions = await sequelize.query(
        `SELECT q.question_id, q.question_text, q.type, q.difficulty_level, q.marks, q.created_at, q.photo,
                  qo.option_id, qo.option_text, qo.option_type, qo.option_value,
                  a.answer_id, a.answer_text, a.is_correct, a.matched_pair, a.response_code
           FROM Section_Questions sq
           JOIN Questions q ON sq.question_id = q.question_id
           LEFT JOIN Question_Options qo ON q.question_id = qo.question_id
           LEFT JOIN Answers a ON q.question_id = a.question_id
           WHERE sq.section_id = :section_id`,
        {
          replacements: { section_id: section.section_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // Format each question with its options and answer
      section.questions = section.questions.reduce((acc, question) => {
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
            question_text: question.question_text,
            type: question.type,
            difficulty_level: question.difficulty_level,
            marks: question.marks,
            created_at: question.created_at,
            photo: question.photo,
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
    }

    // Respond with the complete question paper details
    res.status(200).json({
      paper,
      paper_instructions: paperInstructions,
      sections,
    });
  } catch (error) {
    console.error("Error fetching question paper details:", error);
    res.status(500).json({
      message: "Error fetching question paper details",
      error: error.message,
    });
  }
};

exports.deleteQuestionPaper = async (req, res) => {
  const { paper_id } = req.params; // Get paper_id from URL params

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Step 1: Fetch the questions associated with the paper via Section_Questions
    const questions = await sequelize.query(
      `SELECT DISTINCT q.question_id 
         FROM Section_Questions sq 
         JOIN Questions q ON sq.question_id = q.question_id 
         WHERE sq.section_id IN (SELECT section_id FROM Paper_Sections WHERE paper_id = :paper_id) AND q.active = 0`, // Make sure to only select inactive questions
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    // Step 2: Mark the questions as active = 1 (if they were previously inactive)
    if (questions.length > 0) {
      const questionIds = questions.map((q) => q.question_id);
      await sequelize.query(
        `UPDATE Questions 
           SET active = 1 
           WHERE question_id IN (:questionIds)`,
        {
          replacements: { questionIds },
          type: sequelize.QueryTypes.UPDATE,
          transaction,
        }
      );
    }

    // Step 3: Delete Section_Questions (removes the question-paper association)
    await sequelize.query(
      `DELETE FROM Section_Questions WHERE section_id IN (SELECT section_id FROM Paper_Sections WHERE paper_id = :paper_id)`,
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      }
    );

    // Step 4: Delete Paper_Instructions
    await sequelize.query(
      `DELETE FROM Paper_Instructions WHERE paper_id = :paper_id`,
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      }
    );

    // Step 5: Delete Section_Instructions
    await sequelize.query(
      `DELETE FROM Section_Instructions WHERE section_id IN (SELECT section_id FROM Paper_Sections WHERE paper_id = :paper_id)`,
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      }
    );

    // Step 6: Delete Paper_Sections
    await sequelize.query(
      `DELETE FROM Paper_Sections WHERE paper_id = :paper_id`,
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      }
    );

    // Step 7: Delete the Question_Papers
    await sequelize.query(
      `DELETE FROM Question_Papers WHERE paper_id = :paper_id`,
      {
        replacements: { paper_id },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      }
    );

    // Commit the transaction
    await transaction.commit();

    // Return success message
    res.status(200).json({ message: "Question paper deleted successfully" });
  } catch (error) {
    console.error("Error deleting question paper:", error);
    await transaction.rollback();
    res
      .status(500)
      .json({ message: "Error deleting question paper", error: error.message });
  }
};

exports.uploadLogo = async (req, res) => {
  const { paper_id } = req.params;

  // Validate if file is uploaded
  if (!req.file) {
    return res.status(400).json({ message: "No logo file uploaded." });
  }

  const logoUrl = `/uploads/${req.file.filename}`; // Path to the uploaded logo file

  try {
    // Update the logo URL in the Question_Papers table
    await sequelize.query(
      `UPDATE Question_Papers 
         SET logo = :logoUrl 
         WHERE paper_id = :paper_id`,
      {
        replacements: { logoUrl, paper_id },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({
      message: "Logo uploaded successfully.",
      logoUrl,
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({
      message: "Error uploading logo",
      error: error.message,
    });
  }
};
