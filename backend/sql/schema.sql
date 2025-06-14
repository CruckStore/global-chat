CREATE TABLE users (
  user_id VARCHAR(36) PRIMARY KEY,
  pseudo  VARCHAR(50) NOT NULL UNIQUE,
  role   ENUM('member','premium','admin') NOT NULL DEFAULT 'member'
);

CREATE TABLE messages (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  pseudo      VARCHAR(50) NOT NULL,
  content     TEXT NOT NULL,
  timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited      BOOLEAN DEFAULT FALSE,
  parent_id   BIGINT NULL,
  FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES messages(id)    ON DELETE SET NULL
);
