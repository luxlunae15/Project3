CREATE SCHEMA IF NOT EXISTS `jogiyo` DEFAULT CHARACTER SET utf8 ;

USE `jogiyo` ;

-- -----------------------------------------------------
-- Table `jogiyo`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`user` (
  `ID` VARCHAR(15) NOT NULL,
  `PASSWD` VARCHAR(15) NOT NULL,
  `NAME` VARCHAR(15) NOT NULL,
  `AUTH` VARCHAR(15) NOT NULL,
  `PHONE` VARCHAR(15),
  `latitude` INT DEFAULT 0,
  `longitude` INT DEFAULT 0,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`store`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`store` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `NAME` VARCHAR(15) NOT NULL,
  `PHONE` VARCHAR(15) NOT NULL,
  `RATE` FLOAT NULL DEFAULT 0,
  `DELIVERY_TIME` INT NULL DEFAULT 99,
  `UPTIME` TIME NULL DEFAULT "00:00:00",
  `CLOSETIME` TIME NULL DEFAULT "23:59:59",
  `PRICE_LIMIT` INT NULL DEFAULT 0,
  `latitude` INT DEFAULT 0,
  `longitude` INT DEFAULT 0,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`menu` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `store_ID` INT NOT NULL,
  `NAME` VARCHAR(15) NOT NULL,
  `PRICE` INT NOT NULL,
  `content` LONGTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE,
  CONSTRAINT `fk_menu_store1`
    FOREIGN KEY (`store_ID`)
    REFERENCES `jogiyo`.`store` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`review`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`review` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `rate` FLOAT NULL DEFAULT 3,
  `content` LONGTEXT NULL,
  `user_ID` VARCHAR(15) NOT NULL,
  `menu_ID` INT NOT NULL,
  `store_ID` INT NOT NULL,
  PRIMARY KEY (`ID`, `user_ID`, `menu_ID`, `store_ID`),
  INDEX `fk_review_user1_idx` (`user_ID` ASC) VISIBLE,
  INDEX `fk_review_menu1_idx` (`menu_ID` ASC) VISIBLE,
  INDEX `fk_review_store1_idx` (`store_ID` ASC) VISIBLE,
  CONSTRAINT `fk_review_user1`
    FOREIGN KEY (`user_ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_review_menu1`
    FOREIGN KEY (`menu_ID`)
    REFERENCES `jogiyo`.`menu` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_review_store1`
    FOREIGN KEY (`store_ID`)
    REFERENCES `jogiyo`.`store` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`user_menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`user_menu` (
  `user_ID` VARCHAR(15) NOT NULL,
  `menu_ID` INT NOT NULL,
  `cnt` INT DEFAULT 1,
  PRIMARY KEY (`user_ID`, `menu_ID`),
  INDEX `fk_user_has_menu_menu1_idx` (`menu_ID` ASC) VISIBLE,
  INDEX `fk_user_has_menu_user_idx` (`user_ID` ASC) VISIBLE,
  CONSTRAINT `fk_user_has_menu_user`
    FOREIGN KEY (`user_ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_has_menu_menu1`
    FOREIGN KEY (`menu_ID`)
    REFERENCES `jogiyo`.`menu` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`store_user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`store_user` (
  `store_ID` INT NOT NULL,
  `user_ID` VARCHAR(15) NOT NULL,
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
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`category` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `NAME` VARCHAR(15) NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`category_menu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`category_store` (
  `category_ID` INT NOT NULL,
  `store_ID` INT NOT NULL,
  PRIMARY KEY (`category_ID`, `store_ID`),
  INDEX `fk_category_has_store_store1_idx` (`store_ID` ASC) VISIBLE,
  INDEX `fk_category_has_store_category1_idx` (`category_ID` ASC) VISIBLE,
  CONSTRAINT `fk_category_has_store_category1`
    FOREIGN KEY (`category_ID`)
    REFERENCES `jogiyo`.`category` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_category_has_store_store1`
    FOREIGN KEY (`store_ID`)
    REFERENCES `jogiyo`.`store` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`coupon`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`coupon` (
  `store_ID` INT NOT NULL,
  `user_ID` VARCHAR(15) NOT NULL,
  `number` INT NULL DEFAULT 0,
  PRIMARY KEY (`store_ID`, `user_ID`),
  INDEX `fk_store_has_user_user2_idx` (`user_ID` ASC) VISIBLE,
  INDEX `fk_store_has_user_store2_idx` (`store_ID` ASC) VISIBLE,
  CONSTRAINT `fk_store_has_user_store2`
    FOREIGN KEY (`store_ID`)
    REFERENCES `jogiyo`.`store` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_store_has_user_user2`
    FOREIGN KEY (`user_ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`user_history`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`sold_history` (
  `history` DATETIME DEFAULT NOW(),
  `user_ID` VARCHAR(15) NOT NULL,
  `menu_ID` INT NOT NULL,
  `cnt` INT DEFAULT 1,
  INDEX `fk_sold_history_menu1_idx` (`menu_ID` ASC) VISIBLE,
  INDEX `fk_sold_history_user1_idx` (`user_ID` ASC) INVISIBLE,
  PRIMARY KEY (`user_ID`, `menu_ID`, `history`),
  CONSTRAINT `fk_sold_history_menu1`
    FOREIGN KEY (`menu_ID`)
    REFERENCES `jogiyo`.`menu` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_sold_history_user1`
    FOREIGN KEY (`user_ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `jogiyo`.`comment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogiyo`.`comment` (
  `review_ID` INT NOT NULL,
  `user_ID` VARCHAR(15) NOT NULL,
  `content` LONGTEXT NULL,
  PRIMARY KEY (`review_ID`, `user_ID`),
  INDEX `fk_comment_user1_idx` (`user_ID` ASC) VISIBLE,
  CONSTRAINT `fk_comment_review1`
    FOREIGN KEY (`review_ID`)
    REFERENCES `jogiyo`.`review` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_comment_user1`
    FOREIGN KEY (`user_ID`)
    REFERENCES `jogiyo`.`user` (`ID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;