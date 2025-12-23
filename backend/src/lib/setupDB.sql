CREATE DATABASE WEB;
GO

USE WEB;
GO


DROP TABLE IF EXISTS dbo.Notifications;
DROP TABLE IF EXISTS dbo.GroupMembers;
DROP TABLE IF EXISTS dbo.Reactions;
DROP TABLE IF EXISTS dbo.Messages;
DROP TABLE IF EXISTS dbo.Groups;
DROP TABLE IF EXISTS dbo.Users;

CREATE TABLE dbo.Users (
  userid INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(50) NOT NULL UNIQUE,
  fullname NVARCHAR(30) NOT NULL,
  [password] NVARCHAR(100) NOT NULL CHECK (LEN([password]) >= 6),
  profilepic NVARCHAR(MAX) NULL DEFAULT (''),
  bio NVARCHAR(500) NULL DEFAULT (''), 
  created DATETIME DEFAULT GETDATE(),
  updated DATETIME DEFAULT GETDATE()
);

CREATE TABLE dbo.Groups (
  groupid INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  owner_id INT NOT NULL, 
  group_pic NVARCHAR(MAX) NULL DEFAULT (''),
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (owner_id) REFERENCES dbo.Users(userid) ON DELETE CASCADE
);

CREATE TABLE dbo.GroupMembers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  role NVARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  nickname NVARCHAR(50) NULL, 
  joined_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (group_id) REFERENCES dbo.Groups(groupid) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES dbo.Users(userid) 
);

CREATE UNIQUE INDEX UQ_Group_User ON dbo.GroupMembers(group_id, user_id);

CREATE TABLE dbo.Messages (
  messageid INT IDENTITY(1,1) PRIMARY KEY,

  senderid INT NOT NULL,
  receiverid INT NULL,
  group_id INT NULL,

  content NVARCHAR(MAX) NULL,
  [file] NVARCHAR(MAX) NULL DEFAULT (''),

  replyToId INT NULL,
  isForwarded BIT NOT NULL DEFAULT (0),

  seen BIT NOT NULL DEFAULT (0),
  seenAt DATETIME NULL,

  created DATETIME NOT NULL DEFAULT GETDATE(),

  -- FK users / groups
  CONSTRAINT FK_Messages_Sender
    FOREIGN KEY (senderid) REFERENCES dbo.Users(userid),

  CONSTRAINT FK_Messages_Receiver
    FOREIGN KEY (receiverid) REFERENCES dbo.Users(userid),

  CONSTRAINT FK_Messages_Group
    FOREIGN KEY (group_id) REFERENCES dbo.Groups(groupid)
    ON DELETE CASCADE,

  -- reply self-reference
  CONSTRAINT FK_Messages_ReplyTo
    FOREIGN KEY (replyToId) REFERENCES dbo.Messages(messageid),

  -- private chat XOR group chat
  CONSTRAINT CHK_Message_Type CHECK (
    (receiverid IS NOT NULL AND group_id IS NULL)
    OR
    (receiverid IS NULL AND group_id IS NOT NULL)
  )
);

CREATE TABLE dbo.Reactions (
  reactionid INT IDENTITY(1,1) PRIMARY KEY,

  messageid INT NOT NULL,
  userid INT NOT NULL,
  emoji NVARCHAR(10) NOT NULL,

  created DATETIME NOT NULL DEFAULT GETDATE(),

  -- FK
  CONSTRAINT FK_Reactions_Message
    FOREIGN KEY (messageid)
    REFERENCES dbo.Messages(messageid)
    ON DELETE CASCADE,

  CONSTRAINT FK_Reactions_User
    FOREIGN KEY (userid)
    REFERENCES dbo.Users(userid),
);


CREATE TABLE dbo.Notifications (
  notif_id INT IDENTITY(1,1) PRIMARY KEY,
  receiver_id INT NOT NULL, 
  sender_id INT NULL,       
  group_id INT NULL,        
  type NVARCHAR(50) NOT NULL, 
  content NVARCHAR(255),
  is_read BIT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (receiver_id) REFERENCES dbo.Users(userid),
  FOREIGN KEY (group_id) REFERENCES dbo.Groups(groupid)
);

GO

CREATE TRIGGER trg_UpdateUserTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE Users
  SET updated = GETDATE()
  FROM Users u
  INNER JOIN inserted i ON u.userid = i.userid;
END;

SELECT * FROM dbo.Notifications;
SELECT * FROM dbo.GroupMembers;
SELECT * FROM dbo.Messages;
SELECT * FROM dbo.Reactions
SELECT * FROM dbo.Groups;
SELECT * FROM dbo.Users;