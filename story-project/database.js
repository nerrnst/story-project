const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "data", "stories.db"));


// ================================
// STORIES TABLE
// ================================

db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);


// ================================
// ADD USER_ID TO EXISTING DATABASES
// ================================

try {

    db.exec(`
        ALTER TABLE stories
        ADD COLUMN user_id INTEGER
    `);

} catch (error) {

    // Column already exists.
    // This is safe to ignore.
    
}


// ================================
// USERS TABLE
// ================================

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);


module.exports = db;
