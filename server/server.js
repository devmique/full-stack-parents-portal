require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const messageRoutes = require('./routes/messages')
const announcementRoutes = require('./routes/announcements')
const subjectRoutes = require('./routes/subjects');
const scheduleRoutes = require('./routes/schedule');
const gradesRoute = require('./routes/grades')
const calendarRoutes = require('./routes/calendar');
const attendanceRoutes = require('./routes/attendance');
const notificationRoutes = require('./routes/notifications');
const messagenotifRoutes = require('./routes/messagenotif');
const studentlist = require("./routes/studentlist")
const subjectlist = require("./routes/subjectlist")

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error(" Database connection failed:", err);
    } else {
        console.log("Database Connected!");
    }
});

//attendance route
app.use('/api/attendance', attendanceRoutes)

//grades route
app.use('/api/grades', gradesRoute)

//events route
app.use('/api/calendar', calendarRoutes);

//announcements route 
app.use('/api/announcements', announcementRoutes)

//connect message route
app.use('/api/messages', messageRoutes)


//subjects route
app.use('/api/subjects', subjectRoutes);

//schedule route
app.use('/api/schedule', scheduleRoutes);

//notif route
app.use('/api/notifications', notificationRoutes);

//message notif route
app.use('/api/messagenotif', messagenotifRoutes);

//list route
app.use('/api/studentlist', studentlist)

app.use('/api/subjectlist', subjectlist)

// Configure Multer for Profile Picture Uploads
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
    },
});

const upload = multer({ storage });

//  Upload Profile Picture API
app.post("/upload-profile-pic", upload.single("profilePic"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        //  Save image URL to database
        db.query("UPDATE users SET profile_pic = ? WHERE id = ?", [imageUrl, userId], (err) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ message: "Profile picture updated!", profilePic: imageUrl });
        });
    } catch (error) {
        return res.status(401).json({ error: "Invalid Token" });
    }
});


//  Serve Uploaded Images
app.use("/uploads", express.static("uploads"));

//delete account
app.delete("/delete-account", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        db.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ message: "Account deleted successfully" });
        });
    } catch (error) {
        return res.status(401).json({ error: "Invalid Token" });
    }
});

//  Create Help Requests Table if Not Exists
const createHelpTable = `
CREATE TABLE IF NOT EXISTS help_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    issue TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;
db.query(createHelpTable, (err) => {
    if (err) console.error("Error creating help_requests table:", err);
});

// Help Request Submission Route
app.post("/help", (req, res) => {
    const { userName, issue } = req.body;

    if (!userName || !issue) {
        return res.status(400).json({ error: "Missing required fields!" });
    }

    db.query("INSERT INTO help_requests (user_name, issue) VALUES (?, ?)", [userName, issue], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to save complaint." });
        }
        res.json({ success: true, message: "Issue submitted successfully." });
    });
});


//  User Registration (Only "Parent" Can Register)
app.post("/register", (req, res) => {
    const { name, email, password, contactNumber } = req.body;

    if (!name || !email || !password || !contactNumber) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error!" });

        if (results.length > 0) {
            return res.status(400).json({ error: "Email is already registered!" });
       }

        // Auto-assign role as "parent"
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error(" Error hashing password:", err);
                return res.status(500).json({ error: "Error hashing password" });
            }

            const role = "parent";
           const sql = "INSERT INTO users (name, email, password, contact_number, role, profile_pic) VALUES (?, ?, ?, ?, ?, ?)";
db.query(sql, [name, email, hashedPassword, contactNumber, role, null], (err) => {

                if (err) {
                    console.error(" Database Error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                               res.json({ message: "User registered successfully!",role });
                               
            });
        });
    });
});

//  User Login (Admin & Parent)
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Internal Server Error" });

        if (results.length === 0) {
            return res.status(401).json({ error: "User not found!" });
        }

        const user = results[0];

        //  Ensure passwords match (compare hashed password)
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error(" Error comparing passwords:", err);
                return res.status(500).json({ error: "Error processing login" });
            }

            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials!" });
            }

            //  Generate JWT token
              const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
             
            res.json({
                message: "Login successful!",
                token,
                id: user.id,
                name: user.name, 
                role: user.role,
                email: user.email,
                contactNumber:user.contact_number,
                profilePic: user.profile_pic || "/default-profile.png",
            });
        });
    });
});


//  Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});

