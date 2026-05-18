-- MySQL dump 10.13  Distrib 8.0.33, for macos13 (x86_64)
--
-- Host: localhost    Database: Redemption User Accounts
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `Redemption User Accounts`
--


USE `redemption_db`;

--
-- Table structure for table `activations`
--

DROP TABLE IF EXISTS `activations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activations` (
  `activation_record_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `activation_code` varchar(50) DEFAULT NULL,
  `expiration_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`activation_record_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activations`
--

LOCK TABLES `activations` WRITE;
/*!40000 ALTER TABLE `activations` DISABLE KEYS */;
/*!40000 ALTER TABLE `activations` ENABLE KEYS */;
UNLOCK TABLES;



DROP TABLE IF EXISTS `user_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_info` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(225) DEFAULT NULL,
  `create_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `activated` tinyint(1) DEFAULT NULL,
  `activation_expiration_datetime` datetime DEFAULT NULL,
  `user_icon` varchar(1024) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_info`
--

LOCK TABLES `user_info` WRITE;
/*!40000 ALTER TABLE `user_info` DISABLE KEYS */;
INSERT INTO `user_info` VALUES (3,'Wingman','marcolau733@gmail.com','$2b$10$kIoEQ04kMySUgLmU0ZXQg..OVvyaIVBx6ySgUBu4o5B3Ovl.HpwEy','2026-03-01 18:26:52',1,NULL,'profiles/User-3-Avatar.jpg','2026-05-16 20:03:08'),(4,'LOL','test@gmail.com','$2b$10$dEaeMbNKUdG.6GYHLsdK6e5B1xdfHNUMDV8c7aJw0lieWSQ7RKjlW','2026-03-04 20:56:35',1,NULL,'profiles/User-4-Avatar.jpg','2026-05-16 18:41:57'),(22,'Siu Hin','slau0048@student.monash.edu','$2b$10$NSG9dhS5FTto24HsgxUsjehUyUCoK61jaJKAVy0xR6fQqL1ax0d8K','2026-03-12 17:16:26',1,'2026-03-13 17:16:26',NULL,'2026-05-12 05:34:44');
/*!40000 ALTER TABLE `user_info` ENABLE KEYS */;
UNLOCK TABLES;






--
-- Table structure for table `join_history`
--

DROP TABLE IF EXISTS `join_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `join_history` (
  `join_history_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `join_history_hosted_by` int NOT NULL,
  `join_history_score` int DEFAULT '0',
  `join_history_game_start_datetime` datetime DEFAULT NULL,
  `join_history_answer_history` json DEFAULT NULL,
  `join_history_completness` enum('Incomplete','Completed','Kicked','Terminated By Host') DEFAULT 'Incomplete',
  `join_history_snapshot_id` int NOT NULL,
  PRIMARY KEY (`join_history_id`),
  KEY `fk_user_account` (`user_id`),
  KEY `fk_host_user` (`join_history_hosted_by`),
  KEY `fk_history_snapshot` (`join_history_snapshot_id`),
  CONSTRAINT `fk_history_snapshot` FOREIGN KEY (`join_history_snapshot_id`) REFERENCES `problem_set_snapshots` (`snapshot_id`),
  CONSTRAINT `fk_host_user` FOREIGN KEY (`join_history_hosted_by`) REFERENCES `USER_INFO` (`user_id`),
  CONSTRAINT `fk_user_account` FOREIGN KEY (`user_id`) REFERENCES `USER_INFO` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `join_history`
--

LOCK TABLES `join_history` WRITE;
/*!40000 ALTER TABLE `join_history` DISABLE KEYS */;
INSERT INTO `join_history` VALUES (57,3,4,550,'2026-05-07 14:36:48','[\"B\", \"C\", \"C\", \"TIMEOUT_NULL\", \"B\", \"Something\", \"TIMEOUT_NULL\", \"Bye Bye\", \"D\", \"B\"]','Completed',2),(58,3,4,0,'2026-05-08 14:56:40',NULL,'Terminated By Host',2),(59,3,4,0,'2026-05-08 14:58:53',NULL,'Kicked',2),(60,4,3,0,'2026-05-10 02:41:06','[\"B\"]','Completed',7),(61,3,4,0,'2026-05-13 08:49:58','[\"A\", \"B\"]','Completed',6),(62,4,3,0,'2026-05-13 15:26:33','[\"TIMEOUT_NULL\"]','Completed',7),(63,3,4,610,'2026-05-15 12:09:15','[\"B\", \"C\", \"C\", \"A\", \"TIMEOUT_NULL\", \"TIMEOUT_NULL\", \"A\", \"Bye Bye\", \"TIMEOUT_NULL\", \"B\"]','Completed',11);
/*!40000 ALTER TABLE `join_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `expiration` datetime NOT NULL,
  `validation_code` varchar(225) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `validation_code` (`validation_code`),
  KEY `email` (`email`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`email`) REFERENCES `user_info` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem_set_snapshots`
--

DROP TABLE IF EXISTS `problem_set_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_set_snapshots` (
  `snapshot_id` int NOT NULL AUTO_INCREMENT,
  `set_hash` char(64) NOT NULL,
  `problem_set_title` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`snapshot_id`),
  UNIQUE KEY `set_hash` (`set_hash`),
  KEY `idx_set_hash` (`set_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem_set_snapshots`
--

LOCK TABLES `problem_set_snapshots` WRITE;
/*!40000 ALTER TABLE `problem_set_snapshots` DISABLE KEYS */;
INSERT INTO `problem_set_snapshots` VALUES (2,'b55b6f13a98e6b2f7af7ede59c3ffab6f699cfb8c684a82e218d006e19d7f898','Second trsting problem set longer title finally should work now 1','2026-05-07 14:36:48'),(3,'565cd1298cb3eb2d4ceb6cdc2d72c6efe4495abc6d460b83b0cb54395f960c72','New Problem Shit Bro','2026-05-07 14:48:40'),(4,'ba94c049c472c66a157c700fa3c716e37087ba84d4064ffb62ad961c890243c8','New Problem Shit Bro','2026-05-07 15:31:26'),(5,'07b013bacea13cbc18c5ce088936cf6e4d8b0b6cf046456f4376055e58166256','New Problem Shit Bro','2026-05-07 15:32:53'),(6,'e5740071a3eed82f29fcd1141b3a09405b30aad27e9acd6ba44f3d525822a218','New Problem Shit Bro','2026-05-07 15:35:11'),(7,'645d80a15641537befe5682f2dc1bf7e8513224a716cf44a102a84fec8175233','Test for wings','2026-05-08 13:51:25'),(8,'d2949320fa25b003f5c0899ea3ca7382d1af2577139ba458d1db4a82b3e5c9b3','Test for wings','2026-05-14 16:15:45'),(9,'0c4232c2d93af55c1e68cb6347526c874c8242b1ae77bb145bf8df7682e78f4f','Test for wings','2026-05-15 11:48:33'),(10,'b15683d39cc3ee1f6434cedd23134982bdef4ed17aee14b337ba0c3cb64d9fe6','Test for wings','2026-05-15 11:54:32'),(11,'89e6b2b05eff94abd3320175961a80f1295c40fea74b1e8058da959f2a372b48','Second trsting problem set longer title finally should work now 1','2026-05-15 12:09:15');
/*!40000 ALTER TABLE `problem_set_snapshots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem_sets`
--

DROP TABLE IF EXISTS `problem_sets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_sets` (
  `problem_set_id` int NOT NULL AUTO_INCREMENT,
  `problem_set_title` varchar(225) NOT NULL,
  `problem_set_description` varchar(500) DEFAULT NULL,
  `problem_counts` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_update_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`problem_set_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `problem_sets_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user_info` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem_sets`
--

LOCK TABLES `problem_sets` WRITE;
/*!40000 ALTER TABLE `problem_sets` DISABLE KEYS */;
INSERT INTO `problem_sets` VALUES (2,'Second trsting problem set longer title finally should work now 1','This is an another test problem set with no problems in it',10,4,'2026-03-10 12:34:56','2026-05-14 01:37:25'),(3,'Third problem set more testing and update','This is the third problem set HEHE Bye More updates. Added more things',0,4,'2026-03-10 12:34:56','2026-03-10 12:34:56'),(8,'Let\'s go!!!','Used the wrong attribute name',0,4,'2026-03-22 19:56:30','2026-03-22 19:56:30'),(11,'New Problem Shit Bro','Bro this is something',2,4,'2026-03-27 22:38:10','2026-05-07 15:35:09'),(12,'Test for wings','This is a test for wings',1,3,'2026-05-08 22:26:42','2026-05-15 11:57:37');
/*!40000 ALTER TABLE `problem_sets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problems`
--

DROP TABLE IF EXISTS `problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problems` (
  `problem_id` int NOT NULL AUTO_INCREMENT,
  `problem_set_id` int NOT NULL,
  `sequence_no` int NOT NULL,
  `question_type` varchar(225) NOT NULL,
  `question_text` varchar(500) NOT NULL,
  `answer_options` json NOT NULL,
  `correct_answer` json NOT NULL,
  `case_sensitive` tinyint(1) DEFAULT '0',
  `time_allowed_in_seconds` int DEFAULT '15',
  PRIMARY KEY (`problem_id`),
  KEY `problem_set_id` (`problem_set_id`),
  CONSTRAINT `problems_ibfk_1` FOREIGN KEY (`problem_set_id`) REFERENCES `problem_sets` (`problem_set_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problems`
--

LOCK TABLES `problems` WRITE;
/*!40000 ALTER TABLE `problems` DISABLE KEYS */;
INSERT INTO `problems` VALUES (2,2,4,'Multiple Choice','Who will win WDC 2026','{\"A\": \"Max\", \"B\": \"Charles\", \"C\": \"Kimi\", \"D\": \"Oscar\"}','{\"MC\": \"C\", \"Blanks\": \"\"}',0,5),(6,2,6,'Multiple Choice','Who is the best','{\"A\": \"MOM\", \"B\": \"CC\", \"C\": \"Big Big\", \"D\": \"Dad\"}','{\"MC\": \"C\", \"Blanks\": \"\"}',0,5),(15,2,12,'Blanks','SHIT','{\"A\": \"W\", \"B\": \"R\", \"C\": \"E\", \"D\": \"G\"}','{\"MC\": \"A\", \"Blanks\": \"Bye Bye\"}',0,10),(16,2,7,'Multiple Choice','WOW This is strong','{\"A\": \"Claw\", \"B\": \"Buzz\", \"C\": \"fizz\", \"D\": \"LOL\"}','{\"MC\": \"B\", \"Blanks\": \"\"}',0,10),(18,2,14,'Multiple Choice','Another test','{\"A\": \"1\", \"B\": \"2\", \"C\": \"4\", \"D\": \"5\"}','{\"MC\": \"B\", \"Blanks\": \"\"}',0,5),(26,2,13,'Multiple Choice','Last Test of the night','{\"A\": \"Works\", \"B\": \"Bye\", \"C\": \"Sleep\", \"D\": \"WOW\"}','{\"MC\": \"B\", \"Blanks\": \"Byw World!\"}',1,5),(30,11,1,'Multiple Choice','Fuck me','{\"A\": \"Github\", \"B\": \"LOL\", \"C\": \"HUH\", \"D\": \"Diu\"}','{\"MC\": \"B\", \"Blanks\": \"SIMPLE\"}',0,5),(31,11,2,'Multiple Choice','Please tell me it works now','{\"A\": \"I want to go to sleep\", \"B\": \"Let me push this to GitHub\", \"C\": \"Leave me alone\", \"D\": \"Shouldn\'t be that hard...\"}','{\"MC\": \"D\", \"Blanks\": \"\"}',0,10),(35,2,8,'Multiple Choice','Please','{\"A\": \"Is it working?\", \"B\": \"Please\", \"C\": \"Fefe\", \"D\": \"rg\"}','{\"MC\": \"A\", \"Blanks\": \"\"}',0,10),(36,2,5,'Multiple Choice','Come on','{\"A\": \"Please\", \"B\": \"Let\'s fucking go\", \"C\": \"HUH\", \"D\": \"No error\"}','{\"MC\": \"A\", \"Blanks\": \"\"}',0,10),(41,2,10,'Blanks','A New Problem Before the Shit Problem','{\"A\": \"\", \"B\": \"\", \"C\": \"\", \"D\": \"\"}','{\"MC\": \"\", \"Blanks\": \"Is this shit?\"}',0,10),(42,2,11,'Multiple Choice','Why is the save still here?','{\"A\": \"IDK\", \"B\": \"HUH\", \"C\": \"WHY\", \"D\": \"BOO\"}','{\"MC\": \"A\", \"Blanks\": \"\"}',0,10),(44,12,1,'Blanks','Test','{\"A\": \"Option A\", \"B\": \"Option B\", \"C\": \"This is the correct answer\", \"D\": \"Option D\"}','{\"MC\": \"C\", \"Blanks\": \"Test\"}',1,30);
/*!40000 ALTER TABLE `problems` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `plus_problem_count` AFTER INSERT ON `problems` FOR EACH ROW update problem_sets set problem_counts = problem_counts + 1 where problem_set_id = new.problem_set_id */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `minus_problem_count` AFTER DELETE ON `problems` FOR EACH ROW update problem_sets set problem_counts = problem_counts - 1 where problem_set_id = old.problem_set_id */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `snapshot_questions`
--

DROP TABLE IF EXISTS `snapshot_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `snapshot_questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `snapshot_id` int NOT NULL,
  `question_text` text NOT NULL,
  `question_type` varchar(50) NOT NULL,
  `correct_answer` json NOT NULL,
  `answer_options` json NOT NULL,
  `sequence_no` int NOT NULL,
  PRIMARY KEY (`question_id`),
  KEY `idx_snapshot_sequence` (`snapshot_id`,`sequence_no`),
  CONSTRAINT `fk_snapshot` FOREIGN KEY (`snapshot_id`) REFERENCES `problem_set_snapshots` (`snapshot_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `snapshot_questions`
--

LOCK TABLES `snapshot_questions` WRITE;
/*!40000 ALTER TABLE `snapshot_questions` DISABLE KEYS */;
INSERT INTO `snapshot_questions` VALUES (11,2,'Who will win WDC 2026','Multiple Choice','{\"MC\": \"C\", \"Blanks\": \"\"}','{\"A\": \"Max\", \"B\": \"Charles\", \"C\": \"Kimi\", \"D\": \"Oscar\"}',5),(12,2,'Who is the best','Multiple Choice','{\"MC\": \"C\", \"Blanks\": \"\"}','{\"A\": \"MOM\", \"B\": \"CC\", \"C\": \"Big Big\", \"D\": \"Dad\"}',6),(13,2,'SHIT','Blanks','{\"MC\": \"A\", \"Blanks\": \"Bye Bye\"}','{\"A\": \"W\", \"B\": \"R\", \"C\": \"E\", \"D\": \"G\"}',12),(14,2,'WOW This is strong','Multiple Choice','{\"MC\": \"B\", \"Blanks\": \"\"}','{\"A\": \"Claw\", \"B\": \"Buzz\", \"C\": \"fizz\", \"D\": \"LOL\"}',7),(15,2,'Another test','Multiple Choice','{\"MC\": \"B\", \"Blanks\": \"\"}','{\"A\": \"1\", \"B\": \"2\", \"C\": \"4\", \"D\": \"5\"}',14),(16,2,'Last Test of the night','Multiple Choice','{\"MC\": \"B\", \"Blanks\": \"Byw World!\"}','{\"A\": \"Works\", \"B\": \"Bye\", \"C\": \"Sleep\", \"D\": \"WOW\"}',13),(17,2,'Please','Multiple Choice','{\"MC\": \"A\", \"Blanks\": \"\"}','{\"A\": \"Is it working?\", \"B\": \"Please\", \"C\": \"Fefe\", \"D\": \"rg\"}',8),(18,2,'Come on','Multiple Choice','{\"MC\": \"A\", \"Blanks\": \"\"}','{\"A\": \"Please\", \"B\": \"Let\'s fucking go\", \"C\": \"HUH\", \"D\": \"No error\"}',4),(19,2,'A New Problem Before the Shit Problem','Blanks','{\"MC\": \"\", \"Blanks\": \"Is this shit?\"}','{\"A\": \"\", \"B\": \"\", \"C\": \"\", \"D\": \"\"}',10),(20,2,'Why is the save still here?','Multiple Choice','{\"MC\": \"A\", \"Blanks\": \"\"}','{\"A\": \"IDK\", \"B\": \"HUH\", \"C\": \"WHY\", \"D\": \"BOO\"}',11),(21,3,'Fuck me','Blanks','{\"MC\": \"B\", \"Blanks\": \"Fixed?\"}','{\"A\": \"Github\", \"B\": \"LOL\", \"C\": \"HUH\", \"D\": \"Diu\"}',1),(22,3,'Please tell me it works now','Multiple Choice','{\"MC\": \"D\", \"Blanks\": \"\"}','{\"A\": \"I want to go to sleep\", \"B\": \"Let me push this to GitHub\", \"C\": \"Leave me alone\", \"D\": \"Shouldn\'t be that hard...\"}',2),(23,4,'Fuck me','Blanks','{\"MC\": \"B\", \"Blanks\": \"KOLLLL\"}','{\"A\": \"Github\", \"B\": \"LOL\", \"C\": \"HUH\", \"D\": \"Diu\"}',1),(24,4,'Please tell me it works now','Multiple Choice','{\"MC\": \"D\", \"Blanks\": \"\"}','{\"A\": \"I want to go to sleep\", \"B\": \"Let me push this to GitHub\", \"C\": \"Leave me alone\", \"D\": \"Shouldn\'t be that hard...\"}',2),(25,5,'Fuck me','Blanks','{\"MC\": \"B\", \"Blanks\": \"SIMPLE\"}','{\"A\": \"Github\", \"B\": \"LOL\", \"C\": \"HUH\", \"D\": \"Diu\"}',1),(26,5,'Please tell me it works now','Multiple Choice','{\"MC\": \"D\", \"Blanks\": \"\"}','{\"A\": \"I want to go to sleep\", \"B\": \"Let me push this to GitHub\", \"C\": \"Leave me alone\", \"D\": \"Shouldn\'t be that hard...\"}',2),(27,6,'Fuck me','Multiple Choice','{\"MC\": \"B\", \"Blanks\": \"SIMPLE\"}','{\"A\": \"Github\", \"B\": \"LOL\", \"C\": \"HUH\", \"D\": \"Diu\"}',1),(28,6,'Please tell me it works now','Multiple Choice','{\"MC\": \"D\", \"Blanks\": \"\"}','{\"A\": \"I want to go to sleep\", \"B\": \"Let me push this to GitHub\", \"C\": \"Leave me alone\", \"D\": \"Shouldn\'t be that hard...\"}',2),(29,7,'Test','Multiple Choice','{\"MC\": \"C\", \"Blanks\": \"\"}','{\"A\": \"Option A\", \"B\": \"Option B\", \"C\": \"Option C\", \"D\": \"Option D\"}',1),(30,8,'Test','Multiple Choice','{\"MC\": \"C\", \"Blanks\": \"\"}','{\"A\": \"Option A\", \"B\": \"Option B\", \"C\": \"This is the correct answer\", \"D\": \"Option D\"}',1),(31,9,'Test','Blanks','{\"MC\": \"C\", \"Blanks\": \"Test\"}','{\"A\": \"Option A\", \"B\": \"Option B\", \"C\": \"This is the correct answer\", \"D\": \"Option D\"}',1),(32,10,'Test','Multiple Choice','{\"MC\": \"C\", \"Blanks\": \"Test\"}','{\"A\": \"Option A\", \"B\": \"Option B\", \"C\": \"This is the correct answer\", \"D\": \"Option D\"}',1),(33,11,'Who will win WDC 2026','Multiple Choice','{\"MC\": \"C\", \"Blanks\": \"\"}','{\"A\": \"Max\", \"B\": \"Charles\", \"C\": \"Kimi\", \"D\": \"Oscar\"}',4),(34,11,'Who is the best','Multiple Choice','{\"MC\": \"C\", \"Blanks\": \"\"}','{\"A\": \"MOM\", \"B\": \"CC\", \"C\": \"Big Big\", \"D\": \"Dad\"}',6),(35,11,'SHIT','Blanks','{\"MC\": \"A\", \"Blanks\": \"Bye Bye\"}','{\"A\": \"W\", \"B\": \"R\", \"C\": \"E\", \"D\": \"G\"}',12),(36,11,'WOW This is strong','Multiple Choice','{\"MC\": \"B\", \"Blanks\": \"\"}','{\"A\": \"Claw\", \"B\": \"Buzz\", \"C\": \"fizz\", \"D\": \"LOL\"}',7),(37,11,'Another test','Multiple Choice','{\"MC\": \"B\", \"Blanks\": \"\"}','{\"A\": \"1\", \"B\": \"2\", \"C\": \"4\", \"D\": \"5\"}',14),(38,11,'Last Test of the night','Multiple Choice','{\"MC\": \"B\", \"Blanks\": \"Byw World!\"}','{\"A\": \"Works\", \"B\": \"Bye\", \"C\": \"Sleep\", \"D\": \"WOW\"}',13),(39,11,'Please','Multiple Choice','{\"MC\": \"A\", \"Blanks\": \"\"}','{\"A\": \"Is it working?\", \"B\": \"Please\", \"C\": \"Fefe\", \"D\": \"rg\"}',8),(40,11,'Come on','Multiple Choice','{\"MC\": \"A\", \"Blanks\": \"\"}','{\"A\": \"Please\", \"B\": \"Let\'s fucking go\", \"C\": \"HUH\", \"D\": \"No error\"}',5),(41,11,'A New Problem Before the Shit Problem','Blanks','{\"MC\": \"\", \"Blanks\": \"Is this shit?\"}','{\"A\": \"\", \"B\": \"\", \"C\": \"\", \"D\": \"\"}',10),(42,11,'Why is the save still here?','Multiple Choice','{\"MC\": \"A\", \"Blanks\": \"\"}','{\"A\": \"IDK\", \"B\": \"HUH\", \"C\": \"WHY\", \"D\": \"BOO\"}',11);
/*!40000 ALTER TABLE `snapshot_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_info`
--


--
-- Table structure for table `user_logins`
--

DROP TABLE IF EXISTS `user_logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_logins` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `login_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_user_daily_login` (`user_id`,`login_date`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_logins`
--

LOCK TABLES `user_logins` WRITE;
/*!40000 ALTER TABLE `user_logins` DISABLE KEYS */;
INSERT INTO `user_logins` VALUES (4,3,'2026-05-14'),(3,3,'2026-05-15'),(2,3,'2026-05-16'),(1,3,'2026-05-17'),(5,4,'2026-05-15'),(6,4,'2026-05-17');
/*!40000 ALTER TABLE `user_logins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stats`
--

DROP TABLE IF EXISTS `user_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stats` (
  `user_id` int NOT NULL,
  `highest_score` int DEFAULT NULL,
  `login_streak` int DEFAULT '0',
  `no_of_completed_quiz` int DEFAULT '0',
  `join_count` int DEFAULT '0',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_info_user_stats` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stats`
--

LOCK TABLES `user_stats` WRITE;
/*!40000 ALTER TABLE `user_stats` DISABLE KEYS */;
INSERT INTO `user_stats` VALUES (3,610,4,3,0),(4,0,1,2,0);
/*!40000 ALTER TABLE `user_stats` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-17 20:55:51
