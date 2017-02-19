-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jan 27, 2017 at 06:12 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;


-- --------------------------------------------------------

--
-- Table structure for table `bg_alt_game_name`
--

DROP TABLE IF EXISTS `bg_alt_game_name`;
CREATE TABLE IF NOT EXISTS `bg_alt_game_name` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `game_id` (`game_id`),
  KEY `name_2` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=113027 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_artist`
--

DROP TABLE IF EXISTS `bg_artist`;
CREATE TABLE IF NOT EXISTS `bg_artist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=98162 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_artist_to_game`
--

DROP TABLE IF EXISTS `bg_artist_to_game`;
CREATE TABLE IF NOT EXISTS `bg_artist_to_game` (
  `artist_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  PRIMARY KEY (`artist_id`,`game_id`),
  KEY `atg_game_constrait` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_category`
--

DROP TABLE IF EXISTS `bg_category`;
CREATE TABLE IF NOT EXISTS `bg_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2727 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_category_to_game`
--

DROP TABLE IF EXISTS `bg_category_to_game`;
CREATE TABLE IF NOT EXISTS `bg_category_to_game` (
  `category_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  PRIMARY KEY (`category_id`,`game_id`),
  KEY `ctg_game_constraint` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_designer`
--

DROP TABLE IF EXISTS `bg_designer`;
CREATE TABLE IF NOT EXISTS `bg_designer` (
  `id` int(11) NOT NULL DEFAULT '0',
  `name` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_designer_to_game`
--

DROP TABLE IF EXISTS `bg_designer_to_game`;
CREATE TABLE IF NOT EXISTS `bg_designer_to_game` (
  `designer_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  PRIMARY KEY (`designer_id`,`game_id`),
  KEY `dtg_game_constraint` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_family`
--

DROP TABLE IF EXISTS `bg_family`;
CREATE TABLE IF NOT EXISTS `bg_family` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=39768 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_family_to_game`
--

DROP TABLE IF EXISTS `bg_family_to_game`;
CREATE TABLE IF NOT EXISTS `bg_family_to_game` (
  `family_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  PRIMARY KEY (`family_id`,`game_id`),
  KEY `ftg_game_constraint` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_game`
--

DROP TABLE IF EXISTS `bg_game`;
CREATE TABLE IF NOT EXISTS `bg_game` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(32) NOT NULL DEFAULT 'game',
  `name` varchar(512) NOT NULL,
  `thumbnail` varchar(512) DEFAULT NULL,
  `image` varchar(512) DEFAULT NULL,
  `description` text,
  `min_players` tinyint(4) DEFAULT NULL,
  `max_players` tinyint(4) DEFAULT NULL,
  `play_time` tinyint(4) DEFAULT NULL,
  `year_published` smallint(6) DEFAULT NULL,
  `min_age` smallint(6) DEFAULT NULL,
  `stats_user_rated` mediumint(9) NOT NULL DEFAULT '0',
  `stats_average` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stats_bayes_average` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stats_owned` int(11) NOT NULL,
  `stats_trading` smallint(6) NOT NULL DEFAULT '0',
  `stats_wanting` smallint(6) NOT NULL DEFAULT '0',
  `stats_wishing` smallint(6) NOT NULL DEFAULT '0',
  `stats_num_comments` mediumint(9) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `stats_average` (`stats_average`),
  KEY `stats_owned` (`stats_owned`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=218996 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_game_to_expansion`
--

DROP TABLE IF EXISTS `bg_game_to_expansion`;
CREATE TABLE IF NOT EXISTS `bg_game_to_expansion` (
  `game_id` int(11) NOT NULL,
  `expansion_id` int(11) NOT NULL,
  PRIMARY KEY (`game_id`,`expansion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_imports`
--

DROP TABLE IF EXISTS `bg_imports`;
CREATE TABLE IF NOT EXISTS `bg_imports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `target_id` int(11) NOT NULL,
  `type` varchar(32) NOT NULL,
  `result` varchar(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `target_id_2` (`target_id`),
  KEY `target_id` (`target_id`),
  KEY `result` (`result`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=437325 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_mechanic`
--

DROP TABLE IF EXISTS `bg_mechanic`;
CREATE TABLE IF NOT EXISTS `bg_mechanic` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2690 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_mechanic_to_game`
--

DROP TABLE IF EXISTS `bg_mechanic_to_game`;
CREATE TABLE IF NOT EXISTS `bg_mechanic_to_game` (
  `mechanic_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  PRIMARY KEY (`mechanic_id`,`game_id`),
  KEY `mtg_game_constraint` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_publisher`
--

DROP TABLE IF EXISTS `bg_publisher`;
CREATE TABLE IF NOT EXISTS `bg_publisher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=35224 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_publisher_to_game`
--

DROP TABLE IF EXISTS `bg_publisher_to_game`;
CREATE TABLE IF NOT EXISTS `bg_publisher_to_game` (
  `publisher_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  PRIMARY KEY (`publisher_id`,`game_id`),
  KEY `ptg_game_constraint` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_ranked_list`
--

DROP TABLE IF EXISTS `bg_ranked_list`;
CREATE TABLE IF NOT EXISTS `bg_ranked_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  `friendly_name` varchar(256) NOT NULL,
  `type` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `type` (`type`),
  KEY `friendly_name` (`friendly_name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5500 ;

-- --------------------------------------------------------

--
-- Table structure for table `bg_ranked_list_to_game`
--

DROP TABLE IF EXISTS `bg_ranked_list_to_game`;
CREATE TABLE IF NOT EXISTS `bg_ranked_list_to_game` (
  `ranked_list_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  PRIMARY KEY (`ranked_list_id`,`game_id`),
  KEY `rltg_game_constraint` (`game_id`),
  KEY `rank` (`rank`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_game_attrs`
--

CREATE TABLE IF NOT EXISTS `bg_game_attrs` (
  `game_id` int(11) NOT NULL,
  `attr` varchar(32) NOT NULL,
  UNIQUE KEY `game_id_2` (`game_id`,`attr`),
  KEY `game_id` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `bg_game_similar`
--

CREATE TABLE IF NOT EXISTS `bg_game_similar` (
  `game_id` int(11) NOT NULL,
  `target_game_id` int(11) NOT NULL,
  `match` decimal(4,4) NOT NULL,
  UNIQUE KEY `game_id_2` (`game_id`,`target_game_id`),
  KEY `game_id` (`game_id`),
  KEY `target_game_id` (`target_game_id`),
  KEY `match` (`match`),
  KEY `game_id_3` (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bg_alt_game_name`
--
ALTER TABLE `bg_alt_game_name`
  ADD CONSTRAINT `constraint_game_name_alt` FOREIGN KEY (`game_id`) REFERENCES `bg_game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bg_artist_to_game`
--
ALTER TABLE `bg_artist_to_game`
  ADD CONSTRAINT `atg_game_constrait` FOREIGN KEY (`game_id`) REFERENCES `bg_game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `atg_artist_constraint` FOREIGN KEY (`artist_id`) REFERENCES `bg_artist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bg_category_to_game`
--
ALTER TABLE `bg_category_to_game`
  ADD CONSTRAINT `ctg_game_constraint` FOREIGN KEY (`game_id`) REFERENCES `bg_game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ctg_category_constraint` FOREIGN KEY (`category_id`) REFERENCES `bg_category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bg_designer_to_game`
--
ALTER TABLE `bg_designer_to_game`
  ADD CONSTRAINT `dtg_game_constraint` FOREIGN KEY (`game_id`) REFERENCES `bg_game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `dtg_designer_constraint` FOREIGN KEY (`designer_id`) REFERENCES `bg_designer` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bg_family_to_game`
--
ALTER TABLE `bg_family_to_game`
  ADD CONSTRAINT `ftg_game_constraint` FOREIGN KEY (`game_id`) REFERENCES `bg_game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ftg_family_constraint` FOREIGN KEY (`family_id`) REFERENCES `bg_family` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bg_mechanic_to_game`
--
ALTER TABLE `bg_mechanic_to_game`
  ADD CONSTRAINT `mtg_game_constraint` FOREIGN KEY (`game_id`) REFERENCES `bg_game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mtg_mechanic_constraint` FOREIGN KEY (`mechanic_id`) REFERENCES `bg_mechanic` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bg_publisher_to_game`
--
ALTER TABLE `bg_publisher_to_game`
  ADD CONSTRAINT `ptg_game_constraint` FOREIGN KEY (`game_id`) REFERENCES `bg_game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ptg_publisher_constraint` FOREIGN KEY (`publisher_id`) REFERENCES `bg_publisher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bg_ranked_list_to_game`
--
ALTER TABLE `bg_ranked_list_to_game`
  ADD CONSTRAINT `rltg_game_constraint` FOREIGN KEY (`game_id`) REFERENCES `bg_game` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rltg_list_constraint` FOREIGN KEY (`ranked_list_id`) REFERENCES `bg_ranked_list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
