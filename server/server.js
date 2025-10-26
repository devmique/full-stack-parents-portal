require("dotenv").config();
const { verifyToken } = require("./middleware/authMiddleware");
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
const http = require("http")
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");
const chatbotRoute = require("./routes/chatbot.js")
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.use(express.json());
app.use(cors());
//connect message route
app.use('/api/messages',verifyToken, messageRoutes)

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
app.use('/api/attendance', verifyToken, attendanceRoutes)

//grades route
app.use('/api/grades',verifyToken, gradesRoute)

//events route
app.use('/api/calendar',verifyToken, calendarRoutes);

//announcements route 
app.use('/api/announcements',verifyToken, announcementRoutes)

//chatbot route
app.use("/api/chatbot", chatbotRoute);

//subjects route
app.use('/api/subjects',verifyToken, subjectRoutes);

//schedule route
app.use('/api/schedule',verifyToken, scheduleRoutes);

//notif route
app.use('/api/notifications',verifyToken, notificationRoutes);

//message notif route
app.use('/api/messagenotif',verifyToken, messagenotifRoutes);

//list route
app.use('/api/studentlist',verifyToken, studentlist)
app.use('/api/subjectlist',verifyToken, subjectlist)


//Socket.io setup
const users = new Map(); //store connected users

io.on("connection", (socket)=>{

    //When user joins
    socket.on("register", (userId)=>{
        users.set(userId, socket.id);
        console.log(`User connected`)
    })

    //handle sending message
    socket.on("sendMessage", ({sender_id, receiver_id, message})=>{
        const receiverSocketId = users.get(receiver_id);

        const messageQuery =`INSERT INTO messages (sender_id, receiver_id, message, timestamp)
        VALUES(?, ?, ?, NOW())`;
        db.query(messageQuery, [sender_id, receiver_id, message], (err)=>{
            if(err) return console.error("Message DB error", err);

      // Save notification
      db.query("SELECT name FROM users WHERE id=?", [sender_id], (err, resName) => {
        if (err) return console.error(" Name fetch error:", err);
        const senderName = resName[0]?.name || "Someone";
        const notifMsg = `You received a message from ${senderName}. ${new Date().toLocaleString()}`;
        db.query(
  "INSERT INTO messagenotif (user_id, message) VALUES (?, ?)",
  [receiver_id, notifMsg],
  (err, result) => {
    if (err) return console.error("Failed to save notification:", err);

    const notifData = {
      id: result.insertId,
      user_id: receiver_id,
      message: notifMsg,
      read_status: 0,
      created_at: new Date(),
    };

    // Emit notification to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMsgNotification", notifData);
      console.log("Sent real-time message notification");
    }

  }
);

      });

      //send to receiver in real time
      const msgData = {
        sender_id,
        receiver_id,
        message,
        timestamp: new Date()
      };

      // Emit to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", msgData);
    }

    // Emit back to sender
    io.to(socket.id).emit("receiveMessage", msgData);
  });
    })
      socket.on("disconnect", () => {
    console.log("Socket disconnected");
    for (let [userId, id] of users.entries()) {
      if (id === socket.id) users.delete(userId);
    }
  });
})

app.set("io", io);
app.set("users", users);

// Configure Multer for Profile Picture Uploads
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
    },
});

const upload = multer({ storage });

//  Upload Profile Picture API
app.post("/upload-profile-pic", verifyToken, upload.single("profilePic"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
       const userId = req.user.id;
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
app.delete("/delete-account", verifyToken, (req, res) => {
    try {
        const userId = req.user.id;
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
app.post("/help", verifyToken, (req, res) => {
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

//Send OTP
app.post("/send-otp", (req, res) => {
    const {email } = req.body;

    if(!email.endsWith("@gmail.com")){
        return res.status(400).json({ error: "Please use a valid Gmail address."})
    }
    const otp = Math.floor(100000 + Math.random()* 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    //save to DB
    db.query("INSERT INTO email_verification (email, otp, expires_at) VALUES (?, ?, ?)", [email, otp, expiresAt], (err)=>{
        if(err){
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Internal Server Error"});
        }

        //configure Gmail transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        }
        transporter.sendMail(mailOptions,(error, info)=>{
            if(error){
                console.log("Error sending email:", error);
                return res.status(500).json({ error: "Failed to send OTP email."});
            }
            res.json({message: "OTP sent successfully to your email."});
        })
})
})
//Verify OTP
app.post("/verify-otp", (req, res) => {
    const {email, otp} = req.body;

    db.query("SELECT * FROM email_verification WHERE email = ? ORDER BY id DESC LIMIT 1",[email],(err, results)=>{
        if(err){
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Internal Server Error"});
        }
        if(results.length ===0){
            return res.status(400).json({ error: "No OTP found for this email."});
        }
        const record = results[0];
        if(record.otp !== otp){
            return res.status(400).json({ error: "Invalid OTP."});
        }
        if(new Date(record.expiresAt)< new Date()){
            return res.status(400).json({ error: "OTP has expired."});
        }
        //mark verified
        res.json({ message: "OTP verified successfully."});
    })
})
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

//  User Login 
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
              const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "24h" });
             
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
server.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});

