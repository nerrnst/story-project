const express = require("express");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const db = require("./database");

const app = express();
const PORT = 3000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
    session({
        secret: "story-project-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    })
);


// ========================================
// FILE UPLOADS
// ========================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            path.join(__dirname, "uploads")
        );

    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname);

        const filename =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            extension;

        cb(null, filename);

    }

});


const upload =
    multer({
        storage: storage
    });


// ========================================
// STATIC FILES
// ========================================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ========================================
// CURRENT USER
// ========================================

app.get("/api/me", (req, res) => {

    if (!req.session.userId) {

        return res.json({
            loggedIn: false
        });

    }


    const user =
        db.prepare(`
            SELECT id, username, email
            FROM users
            WHERE id = ?
        `).get(req.session.userId);


    if (!user) {

        req.session.destroy(() => {});

        return res.json({
            loggedIn: false
        });

    }


    res.json({
        loggedIn: true,
        userId: user.id,
        username: user.username,
        email: user.email
    });

});


// ========================================
// REGISTER
// ========================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;


        if (
            !username ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                error: "All fields are required."
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                error: "Password must be at least 6 characters."
            });

        }


        const existingUser =
            db.prepare(`
                SELECT id
                FROM users
                WHERE email = ?
                   OR username = ?
            `).get(email, username);


        if (existingUser) {

            return res.status(409).json({
                error: "Username or email already exists."
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const result =
            db.prepare(`
                INSERT INTO users
                (username, email, password)
                VALUES (?, ?, ?)
            `).run(
                username,
                email,
                hashedPassword
            );


        res.status(201).json({
            message: "Account created successfully.",
            userId: result.lastInsertRowid
        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        res.status(500).json({
            error: "Unable to create account."
        });

    }

});


// ========================================
// LOGIN
// ========================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                error: "Email and password are required."
            });

        }


        const user =
            db.prepare(`
                SELECT *
                FROM users
                WHERE email = ?
            `).get(email);


        if (!user) {

            return res.status(401).json({
                error: "Invalid email or password."
            });

        }


        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatches) {

            return res.status(401).json({
                error: "Invalid email or password."
            });

        }


        req.session.userId =
            user.id;


        res.json({
            message: "Login successful.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        res.status(500).json({
            error: "Unable to login."
        });

    }

});


// ========================================
// LOGOUT
// ========================================

app.post("/api/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            return res.status(500).json({
                error: "Unable to logout."
            });

        }


        res.json({
            message: "Logged out successfully."
        });

    });

});


// ========================================
// GET ALL STORIES
// ========================================

app.get("/api/stories", (req, res) => {

    try {

        const stories =
            db.prepare(`
                SELECT
                    id,
                    title,
                    author,
                    category,
                    content,
                    image,
                    user_id,
                    created_at
                FROM stories
                ORDER BY created_at DESC
            `).all();


        res.json(stories);


    } catch (error) {

        console.error(
            "GET STORIES ERROR:",
            error
        );


        res.status(500).json({
            error: "Unable to load stories."
        });

    }

});


// ========================================
// GET ONE STORY
// ========================================

app.get("/api/stories/:id", (req, res) => {

    try {

        const story =
            db.prepare(`
                SELECT
                    id,
                    title,
                    author,
                    category,
                    content,
                    image,
                    user_id,
                    created_at
                FROM stories
                WHERE id = ?
            `).get(req.params.id);


        if (!story) {

            return res.status(404).json({
                error: "Story not found."
            });

        }


        res.json(story);


    } catch (error) {

        console.error(
            "GET STORY ERROR:",
            error
        );


        res.status(500).json({
            error: "Unable to load story."
        });

    }

});


// ========================================
// CREATE STORY
// ========================================

app.post(
    "/api/stories",
    upload.single("image"),
    (req, res) => {

        try {

            if (!req.session.userId) {

                return res.status(401).json({
                    error: "You must be logged in to publish a story."
                });

            }


            const {
                title,
                author,
                category,
                content
            } = req.body;


            if (
                !title ||
                !author ||
                !category ||
                !content
            ) {

                return res.status(400).json({
                    error: "All story fields are required."
                });

            }


            let imagePath = null;


            if (req.file) {

                imagePath =
                    "/uploads/" +
                    req.file.filename;

            }


            const result =
                db.prepare(`
                    INSERT INTO stories
                    (
                        title,
                        author,
                        category,
                        content,
                        image,
                        user_id
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                    title,
                    author,
                    category,
                    content,
                    imagePath,
                    req.session.userId
                );


            res.status(201).json({
                message: "Story published successfully.",
                id: result.lastInsertRowid
            });


        } catch (error) {

            console.error(
                "CREATE STORY ERROR:",
                error
            );


            res.status(500).json({
                error: "Unable to publish story."
            });

        }

    }
);

// ========================================
// EDIT STORY
// ========================================
//
// IMPORTANT:
// Only the person who owns the story
// can edit it.
// ========================================

app.put(
    "/api/stories/:id",
    upload.single("image"),
    (req, res) => {

        try {

            // User must be logged in
            if (!req.session.userId) {

                return res.status(401).json({
                    error: "You must be logged in."
                });

            }


            // Find the story
            const story =
                db.prepare(`
                    SELECT
                        id,
                        user_id,
                        image
                    FROM stories
                    WHERE id = ?
                `).get(req.params.id);


            // Story doesn't exist
            if (!story) {

                return res.status(404).json({
                    error: "Story not found."
                });

            }


            // Make sure this user owns the story
            if (
                !story.user_id ||
                Number(story.user_id) !==
                Number(req.session.userId)
            ) {

                return res.status(403).json({
                    error: "You can only edit your own stories."
                });

            }


            const {
                title,
                author,
                category,
                content
            } = req.body;


            // Validate required fields
            if (
                !title ||
                !author ||
                !category ||
                !content
            ) {

                return res.status(400).json({
                    error: "All story fields are required."
                });

            }


            // Keep the existing image unless
            // the user uploads a new one.
            let imagePath =
                story.image;


            if (req.file) {

                imagePath =
                    "/uploads/" +
                    req.file.filename;

            }


            // Update the story
            const result =
                db.prepare(`
                    UPDATE stories
                    SET
                        title = ?,
                        author = ?,
                        category = ?,
                        content = ?,
                        image = ?
                    WHERE id = ?
                      AND user_id = ?
                `).run(
                    title,
                    author,
                    category,
                    content,
                    imagePath,
                    req.params.id,
                    req.session.userId
                );


            if (result.changes === 0) {

                return res.status(403).json({
                    error: "Unable to edit this story."
                });

            }


            // If a new image was uploaded,
            // remove the old image.
            if (
                req.file &&
                story.image &&
                story.image !== imagePath
            ) {

                const fs =
                    require("fs");

                const oldImageFile =
                    path.join(
                        __dirname,
                        story.image.replace(
                            /^\/uploads\//,
                            "uploads/"
                        )
                    );


                if (fs.existsSync(oldImageFile)) {

                    try {

                        fs.unlinkSync(oldImageFile);

                    } catch (imageError) {

                        console.error(
                            "OLD IMAGE DELETE ERROR:",
                            imageError
                        );

                    }

                }

            }


            res.json({
                message: "Story updated successfully."
            });


        } catch (error) {

            console.error(
                "EDIT STORY ERROR:",
                error
            );


            res.status(500).json({
                error: "Unable to edit story."
            });

        }

    }
);
// ========================================
// DELETE STORY
// ========================================
//
// IMPORTANT:
// Only the person who owns the story
// can delete it.
// ========================================

app.delete("/api/stories/:id", (req, res) => {

    try {

        // User must be logged in
        if (!req.session.userId) {

            return res.status(401).json({
                error: "You must be logged in."
            });

        }


        const story =
            db.prepare(`
                SELECT
                    id,
                    user_id,
                    image
                FROM stories
                WHERE id = ?
            `).get(req.params.id);


        // Story doesn't exist
        if (!story) {

            return res.status(404).json({
                error: "Story not found."
            });

        }


        // Make sure this user owns the story
        if (
            !story.user_id ||
            Number(story.user_id) !==
            Number(req.session.userId)
        ) {

            return res.status(403).json({
                error: "You can only delete your own stories."
            });

        }


        // Delete the story
        const result =
            db.prepare(`
                DELETE FROM stories
                WHERE id = ?
                  AND user_id = ?
            `).run(
                req.params.id,
                req.session.userId
            );


        if (result.changes === 0) {

            return res.status(403).json({
                error: "Unable to delete this story."
            });

        }


        // Try to delete uploaded image
        // if this story had one.
        if (story.image) {

            const fs =
                require("fs");

            const imageFile =
                path.join(
                    __dirname,
                    story.image.replace(
                        /^\/uploads\//,
                        "uploads/"
                    )
                );


            if (fs.existsSync(imageFile)) {

                try {

                    fs.unlinkSync(imageFile);

                } catch (imageError) {

                    console.error(
                        "IMAGE DELETE ERROR:",
                        imageError
                    );

                }

            }

        }


        res.json({
            message: "Story deleted successfully."
        });


    } catch (error) {

        console.error(
            "DELETE STORY ERROR:",
            error
        );


        res.status(500).json({
            error: "Unable to delete story."
        });

    }

});


// ========================================
// SPA / FRONTEND FALLBACK
// ========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// ========================================
// START SERVER
// ========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Story Project server running at http://localhost:${PORT}`
        );

    }
);
