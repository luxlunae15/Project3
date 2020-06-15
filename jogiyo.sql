-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema jogiyo
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema jogiyo
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `jogiyo` DEFAULT CHARACTER SET utf8 ;
USE `jogiyo` ;

-- -----------------------------------------------------
-- Table `jogiyo`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`category` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `NAME` VARCHAR(15) NULL DEFAULT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`menu` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `NAME` VARCHAR(15) NOT NULL,
  `PRICE` INT NOT NULL,
  `content` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 124
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`category_menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`category_menu` (
  `category_ID` INT NOT NULL,
  `menu_ID` INT NOT NULL,
  PRIMARY KEY (`category_ID`, `menu_ID`),
  INDEX `fk_category_has_menu_menu1_idx` (`menu_ID` ASC) VISIBLE,
  INDEX `fk_category_has_menu_category1_idx` (`category_ID` ASC) VISIBLE,
  CONSTRAINT `fk_category_has_menu_category1`
    FOREIGN KEY (`category_ID`)
    REFERENCES `jogiyo`.`category` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_category_has_menu_menu1`
    FOREIGN KEY (`menu_ID`)
    REFERENCES `jogiyo`.`menu` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`location`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`location` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`store`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`store` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `NAME` VARCHAR(15) NOT NULL,
  `PHONE` VARCHAR(15) NOT NULL,
  `RATE` FLOAT NULL DEFAULT '0',
  `DELIVERY_TIME` INT NULL DEFAULT '99',
  `UPTIME` TIME NULL DEFAULT NULL,
  `location_ID` INT NOT NULL,
  `PRICE_LIMIT` INT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE,
  INDEX `fk_store_location1_idx` (`location_ID` ASC) VISIBLE,
  CONSTRAINT `fk_store_location1`
    FOREIGN KEY (`location_ID`)
    REFERENCES `jogiyo`.`location` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`review`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`review` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `rate` FLOAT NULL DEFAULT '3',
  `content` LONGTEXT NULL DEFAULT NULL,
  `user_ID` VARCHAR(15) NOT NULL,
  `menu_ID` INT NOT NULL,
  `store_ID` INT NOT NULL,
  PRIMARY KEY (`ID`, `user_ID`, `menu_ID`, `store_ID`),
  INDEX `fk_review_store1_idx` (`store_ID` ASC) VISIBLE,
  INDEX `fk_review_menu1_idx` (`menu_ID` ASC) VISIBLE,
  CONSTRAINT `fk_review_store1`
    FOREIGN KEY (`store_ID`)
    REFERENCES `jogiyo`.`store` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_review_menu1`
    FOREIGN KEY (`menu_ID`)
    REFERENCES `jogiyo`.`menu` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_review_user1`
    FOREIGN KEY (`ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`user` (
  `ID` VARCHAR(15) NOT NULL,
  `PASSWD` VARCHAR(15) NOT NULL,
  `NAME` VARCHAR(15) NOT NULL,
  `PHONE` VARCHAR(15) NULL DEFAULT NULL,
  `location_ID` INT NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE,
  INDEX `fk_user_location1_idx` (`location_ID` ASC) VISIBLE,
  CONSTRAINT `fk_user_location1`
    FOREIGN KEY (`location_ID`)
    REFERENCES `jogiyo`.`location` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_review1`
    FOREIGN KEY (`ID`)
    REFERENCES `jogiyo`.`review` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`coupon`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`coupon` (
  `store_ID` INT NOT NULL,
  `user_ID` VARCHAR(15) NOT NULL,
  `number` INT NULL DEFAULT NULL,
  PRIMARY KEY (`store_ID`, `user_ID`),
  INDEX `fk_store_has_user_user1_idx` (`user_ID` ASC) VISIBLE,
  INDEX `fk_store_has_user_store1_idx` (`store_ID` ASC) VISIBLE,
  CONSTRAINT `fk_store_has_user_store1`
    FOREIGN KEY (`store_ID`)
    REFERENCES `jogiyo`.`store` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_store_has_user_user1`
    FOREIGN KEY (`user_ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`manager`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`manager` (
  `ID` VARCHAR(15) NOT NULL,
  `PASSWD` VARCHAR(15) NOT NULL,
  `NAME` VARCHAR(15) NOT NULL,
  `PHONE` VARCHAR(15) NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`seller`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`seller` (
  `ID` VARCHAR(15) NOT NULL,
  `PASSWD` VARCHAR(15) NOT NULL,
  `NAME` VARCHAR(15) NOT NULL,
  `PHONE` VARCHAR(15) NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`store_seller`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`store_seller` (
  `store_ID` INT NOT NULL,
  `seller_ID` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`store_ID`, `seller_ID`),
  INDEX `fk_store_has_seller_seller1_idx` (`seller_ID` ASC) VISIBLE,
  INDEX `fk_store_has_seller_store1_idx` (`store_ID` ASC) VISIBLE,
  CONSTRAINT `fk_store_has_seller_seller1`
    FOREIGN KEY (`seller_ID`)
    REFERENCES `jogiyo`.`seller` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_store_has_seller_store1`
    FOREIGN KEY (`store_ID`)
    REFERENCES `jogiyo`.`store` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`user_menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`user_menu` (
  `user_ID` VARCHAR(15) NOT NULL,
  `menu_ID` INT NOT NULL,
  PRIMARY KEY (`user_ID`, `menu_ID`),
  INDEX `fk_user_has_menu_menu1_idx` (`menu_ID` ASC) VISIBLE,
  INDEX `fk_user_has_menu_user_idx` (`user_ID` ASC) VISIBLE,
  CONSTRAINT `fk_user_has_menu_menu1`
    FOREIGN KEY (`menu_ID`)
    REFERENCES `jogiyo`.`menu` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_has_menu_user`
    FOREIGN KEY (`user_ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `jogiyo`.`user_history`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`user_history` (
  `history_ID` INT NOT NULL AUTO_INCREMENT,
  `user_ID` VARCHAR(15) NOT NULL,
  `menu_ID` INT NOT NULL,
  INDEX `fk_user_history_menu1_idx` (`menu_ID` ASC) VISIBLE,
  INDEX `fk_user_history_user1_idx` (`user_ID` ASC) INVISIBLE,
  PRIMARY KEY (`history_ID`),
  CONSTRAINT `fk_user_history_menu1`
    FOREIGN KEY (`menu_ID`)
    REFERENCES `jogiyo`.`menu` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_history_user1`
    FOREIGN KEY (`user_ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
