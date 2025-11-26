CREATE DATABASE WEB;

CREATE TABLE dbo.Users (
  userid INT IDENTITY(1,1) PRIMARY KEY,   -- Auto-increment unique ID
  email NVARCHAR(50) NOT NULL UNIQUE,     -- email must be unique and required
  fullname NVARCHAR(30) NOT NULL,         -- Required full name
  [password] NVARCHAR(100) NOT NULL CHECK (LEN([password]) >= 6),  -- Required, min length 6
  profilepic NVARCHAR(100) NULL DEFAULT (''),  -- Optional, defaults to empty string
  created DATETIME DEFAULT GETDATE(),
  updated DATETIME DEFAULT GETDATE()
);

CREATE TABLE dbo.Messages (
  messageid INT IDENTITY(1,1) PRIMARY KEY,
  senderid INT NOT NULL,
  receiverid INT NOT NULL,
  content NVARCHAR(500),
  image NVARCHAR(100) NULL DEFAULT (''),  -- Optional image URL
  created DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (senderid) REFERENCES dbo.Users(userid),
  FOREIGN KEY (receiverid) REFERENCES dbo.Users(userid)
);

INSERT INTO dbo.Users (email, fullname, [password], profilepic)
VALUES ('test@example.com', 'Test1', 'secret123', '');

SELECT * FROM Users;
SELECT * FROM Messages;

GO
CREATE TRIGGER trg_UpdateUserTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON; -- Prevent "x rows affected" message from being returned for each command
  UPDATE Users
  SET updated = GETDATE()
  FROM Users u
  INNER JOIN inserted i ON u.userid = i.userid;
END;