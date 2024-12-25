CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `is_active` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);

CREATE TABLE `Boards` (
  `board_id` int NOT NULL AUTO_INCREMENT,
  `Board_name` varchar(255) NOT NULL,
  PRIMARY KEY (`board_id`),
  UNIQUE KEY `board_id` (`board_id`)
);

CREATE TABLE `Classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `class_name` varchar(255) NOT NULL,
  `board_id` int NOT NULL,
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `class_id` (`class_id`)
);

CREATE TABLE `Subjects` (
  `subject_id` int NOT NULL AUTO_INCREMENT,
  `subject_name` varchar(255) NOT NULL,
  `class_id` int NOT NULL,
  PRIMARY KEY (`subject_id`),
  UNIQUE KEY `subject_id` (`subject_id`)
);

CREATE TABLE `Chapters` (
  `chapter_id` int NOT NULL AUTO_INCREMENT,
  `chapter_name` varchar(255) NOT NULL,
  `subject_id` int NOT NULL,
  PRIMARY KEY (`chapter_id`),
  UNIQUE KEY `chapter_id` (`chapter_id`)
);

CREATE TABLE `Tropics` (
  `tropic_id` int NOT NULL AUTO_INCREMENT,
  `tropic_name` varchar(255) NOT NULL,
  `chapter_id` int NOT NULL,
  PRIMARY KEY (`tropic_id`),
  UNIQUE KEY `tropic_id` (`tropic_id`)
);

CREATE TABLE `Questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `topic_id` int NOT NULL,
  `question_text` text NOT NULL,
  `type` enum('Subjective','Objective','Match','Assertion') NOT NULL,
  `difficulty_level` enum('Easy','Medium','Hard') NOT NULL,
  `marks` float NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `photo` varchar(480) DEFAULT NULL,
  `active` int NOT NULL DEFAULT '1',
  `isAnswer` int NOT NULL,
  `board_id` int NOT NULL,
  `class_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `chapter_id` int NOT NULL,
  `tropic_id` int NOT NULL,
  PRIMARY KEY (`question_id`),
  KEY `topic_id` (`topic_id`)
);

CREATE TABLE `Question_Options` (
  `option_id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` text NOT NULL,
  `option_type` enum('Option','Assertion','Reason') NOT NULL,
  `option_value` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`option_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `fk_question_option_question` FOREIGN KEY (`question_id`) REFERENCES `Questions` (`question_id`) ON DELETE CASCADE
);

CREATE TABLE `Answers` (
  `answer_id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `answer_text` text,
  `is_correct` tinyint(1) DEFAULT NULL,
  `matched_pair` text,
  `response_code` varchar(240) DEFAULT NULL,
  PRIMARY KEY (`answer_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `Questions` (`question_id`) ON DELETE CASCADE
);

CREATE TABLE `Question_Papers` (
  `paper_id` int NOT NULL AUTO_INCREMENT,
  `heading` varchar(255) NOT NULL,
  `exam_name` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `class` varchar(50) NOT NULL,
  `total_marks` int NOT NULL,
  `subject_id` int NOT NULL,
  `exam_date` date DEFAULT NULL,
  `watermark_text` varchar(255) DEFAULT NULL,
  `school_name` varchar(255) DEFAULT NULL,
  `total_time` varchar(255) DEFAULT NULL,
  `footer_address` text,
  `footer_contact_info` varchar(255) DEFAULT NULL,
  `font_size` int DEFAULT '12',
  `watermark_placement` varchar(50) DEFAULT 'center',
  `watermark_opacity` float DEFAULT '0.5',
  `watermark_font_size` int DEFAULT '14',
  `number_of_pages` int DEFAULT NULL,
  `active` int DEFAULT '1',
  PRIMARY KEY (`paper_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `Question_Papers_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `Subjects` (`subject_id`) ON DELETE CASCADE
);

CREATE TABLE `Paper_Instructions` (
  `instruction_id` int NOT NULL AUTO_INCREMENT,
  `paper_id` int NOT NULL,
  `instruction_text` text NOT NULL,
  `instruction_order` int DEFAULT '1',
  `active` int DEFAULT '1',
  PRIMARY KEY (`instruction_id`),
  KEY `paper_id` (`paper_id`),
  CONSTRAINT `Paper_Instructions_ibfk_1` FOREIGN KEY (`paper_id`) REFERENCES `Question_Papers` (`paper_id`) ON DELETE CASCADE
);

CREATE TABLE `Paper_Sections` (
  `section_id` int NOT NULL AUTO_INCREMENT,
  `paper_id` int NOT NULL,
  `section_name` varchar(255) NOT NULL,
  `marks_per_question` int NOT NULL,
  `number_of_questions` int NOT NULL,
  `total_section_marks` int NOT NULL,
  `question_type` varchar(50) DEFAULT NULL,
  `active` int DEFAULT '1',
  PRIMARY KEY (`section_id`),
  KEY `paper_id` (`paper_id`),
  CONSTRAINT `Paper_Sections_ibfk_1` FOREIGN KEY (`paper_id`) REFERENCES `Question_Papers` (`paper_id`) ON DELETE CASCADE
);

CREATE TABLE `Section_Instructions` (
  `instruction_id` int NOT NULL AUTO_INCREMENT,
  `section_id` int NOT NULL,
  `instruction_text` text NOT NULL,
  `instruction_order` int DEFAULT '1',
  `active` int DEFAULT '1',
  PRIMARY KEY (`instruction_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `Section_Instructions_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `Paper_Sections` (`section_id`) ON DELETE CASCADE
);

CREATE TABLE `Section_Questions` (
  `section_question_id` int NOT NULL AUTO_INCREMENT,
  `section_id` int NOT NULL,
  `question_id` int NOT NULL,
  `active` int DEFAULT '1',
  PRIMARY KEY (`section_question_id`),
  KEY `section_id` (`section_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `Section_Questions_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `Paper_Sections` (`section_id`) ON DELETE CASCADE,
  CONSTRAINT `Section_Questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `Questions` (`question_id`) ON DELETE CASCADE
);

CREATE TABLE `Modules` (
  `module_id` int NOT NULL AUTO_INCREMENT,
  `Module_name` varchar(255) NOT NULL,
  `class_id` int NOT NULL,
  `board_id` int DEFAULT NULL,
  `Chapter_id` int DEFAULT NULL,
  `Tropic_id` int DEFAULT NULL,
  `difficulty_level` varchar(255) DEFAULT NULL,
  `subject_id` int DEFAULT NULL,
  PRIMARY KEY (`module_id`),
  UNIQUE KEY `module_id` (`module_id`)
);