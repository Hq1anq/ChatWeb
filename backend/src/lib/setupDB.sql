CREATE DATABASE WEB;
GO

USE WEB;
GO

-- 1. Bảng Users (Giữ nguyên logic cũ, gộp Bio vào)
DROP TABLE IF EXISTS dbo.Notifications;
DROP TABLE IF EXISTS dbo.GroupMembers;
DROP TABLE IF EXISTS dbo.Messages;
DROP TABLE IF EXISTS dbo.Groups;
DROP TABLE IF EXISTS dbo.Users;

CREATE TABLE dbo.Users (
  userid INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(50) NOT NULL UNIQUE,
  fullname NVARCHAR(30) NOT NULL,
  [password] NVARCHAR(100) NOT NULL CHECK (LEN([password]) >= 6),
  profilepic NVARCHAR(MAX) NULL DEFAULT (''),
  bio NVARCHAR(500) NULL DEFAULT (''), -- Đã đưa vào đây luôn
  created DATETIME DEFAULT GETDATE(),
  updated DATETIME DEFAULT GETDATE()
);

-- 2. Bảng Groups (MỚI)
CREATE TABLE dbo.Groups (
  groupid INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  owner_id INT NOT NULL, -- Người tạo nhóm (Admin tối cao)
  group_pic NVARCHAR(MAX) NULL DEFAULT (''),
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (owner_id) REFERENCES dbo.Users(userid) ON DELETE CASCADE
);

-- 3. Bảng GroupMembers (MỚI - Quản lý thành viên & Admin & Nickname)
CREATE TABLE dbo.GroupMembers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  role NVARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')), -- Phân quyền
  nickname NVARCHAR(50) NULL, -- Biệt danh trong nhóm
  joined_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (group_id) REFERENCES dbo.Groups(groupid) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES dbo.Users(userid) -- Không cascade user để tránh mất lịch sử nhóm
);

-- Đảm bảo 1 user chỉ ở trong 1 nhóm 1 lần
CREATE UNIQUE INDEX UQ_Group_User ON dbo.GroupMembers(group_id, user_id);

-- 4. Bảng Messages (CẬP NHẬT)
CREATE TABLE dbo.Messages (
  messageid INT IDENTITY(1,1) PRIMARY KEY,
  senderid INT NOT NULL,
  receiverid INT NULL, -- Cho phép NULL nếu là tin nhắn nhóm
  group_id INT NULL,   -- Cho phép NULL nếu là tin nhắn cá nhân
  content NVARCHAR(MAX), -- Tăng giới hạn ký tự
  [file] NVARCHAR(MAX) NULL DEFAULT (''),
  created DATETIME DEFAULT GETDATE(),
  
  FOREIGN KEY (senderid) REFERENCES dbo.Users(userid),
  FOREIGN KEY (receiverid) REFERENCES dbo.Users(userid),
  FOREIGN KEY (group_id) REFERENCES dbo.Groups(groupid) ON DELETE CASCADE,

  -- Ràng buộc: Tin nhắn phải thuộc về (Receiver) HOẶC (Group), không được cả hai hoặc trống cả hai
  CONSTRAINT CHK_Message_Type CHECK (
    (receiverid IS NOT NULL AND group_id IS NULL) OR 
    (receiverid IS NULL AND group_id IS NOT NULL)
  )
);

-- 5. Bảng Notifications (MỚI - Cho chức năng Tag/Add group)
CREATE TABLE dbo.Notifications (
  notif_id INT IDENTITY(1,1) PRIMARY KEY,
  receiver_id INT NOT NULL, -- Người nhận thông báo
  sender_id INT NULL,       -- Người gây ra hành động (người tag, người add)
  group_id INT NULL,        -- Liên quan đến nhóm nào (nếu có)
  type NVARCHAR(50) NOT NULL, -- 'TAG', 'ADD_GROUP', 'NEW_MESSAGE'
  content NVARCHAR(255),
  is_read BIT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (receiver_id) REFERENCES dbo.Users(userid),
  FOREIGN KEY (group_id) REFERENCES dbo.Groups(groupid)
);

GO

-- Trigger update User timestamp
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