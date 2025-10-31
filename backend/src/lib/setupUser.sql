CREATE DATABASE WEB;

CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,   -- Auto-increment unique ID
    Email NVARCHAR(50) NOT NULL UNIQUE,     -- Email must be unique and required
    FullName NVARCHAR(30) NOT NULL,         -- Required full name
    [Password] NVARCHAR(100) NOT NULL CHECK (LEN([Password]) >= 6),  -- Required, min length 6
    ProfilePic NVARCHAR(100) NULL DEFAULT ('')  -- Optional, defaults to empty string
);

INSERT INTO dbo.Users (Email, FullName, [Password], ProfilePic)
VALUES ('test@example.com', 'Test1', 'secret123', '');

SELECT * FROM Users