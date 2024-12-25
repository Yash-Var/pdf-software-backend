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