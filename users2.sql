
-- remove old version table 
DROP TABLE IF EXISTS users;
-- define table columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- append user name & email
INSERT INTO users (name,email) VALUES
    ('Taro','taro@test.com'),
    ('Hanako','hanako@test.com'),
    ('Anthony','beaucamp@test.com'),
    ('Okiharu','kirino@test.com'),
    ('Lyan', 'raymond@test.com'),
    ('Haruka', 'takahira@test.com'),
    ('Prerana', 'chakraba@test.com'),
    ('Thomas', 'dernedan@test.com'),
    ('Dylan', 'beaucamp2@test.com');

-- update email adress
UPDATE users
SET email = 'taro_new@test.com'
WHERE name = 'Taro';

-- delete a user
DELETE FROM users
WHERE name = 'Lyan';

-- check table
SELECT * FROM users;

-- Create table 2
DROP TABLE IF EXISTS extra;
CREATE TABLE extra (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    city TEXT,
    age INTEGER);
INSERT INTO extra (user_id, city, age) VALUES
    (1, 'Tokyo', 32),
    (2, 'Tokyo', 18),
    (3, 'Paris', 45),
    (4, 'Shiga', 50),
    (7, 'Munbai', 28),
    (8, 'Bruxelles', 24),
    (9, 'Paris', 24),
    (10,'Tucson', 30);
-- check table
SELECT * FROM extra;

-- Join, Left/Right Join
SELECT users.name, users.email, extra.city, extra.age
    FROM users
    RIGHT JOIN extra
    ON users.id = extra.user_id;

-- Group by
SELECT city, AVG(age)
    FROM extra
    GROUP BY city;

SELECT city, COUNT(city)
    FROM extra
    GROUP BY city;

SELECT COUNT(city)
    FROM extra
    WHERE age < 40;