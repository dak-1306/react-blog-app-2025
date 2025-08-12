-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN phone VARCHAR(20),
ADD COLUMN bio TEXT,
ADD COLUMN location VARCHAR(100),
ADD COLUMN website VARCHAR(255),
ADD COLUMN avatar VARCHAR(255);

-- Update existing users with default values if needed
UPDATE users SET 
  phone = NULL,
  bio = NULL, 
  location = NULL,
  website = NULL,
  avatar = NULL
WHERE phone IS NULL;
