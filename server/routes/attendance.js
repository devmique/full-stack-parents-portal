const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorizeRole } = require('../middleware/authMiddleware');
// Get all attendance records
router.get('/', (req, res) => {
  const studentId = req.query.student_id; 
  const query = studentId
    ? `
      SELECT attendance.*, students.name AS student_name 
      FROM attendance 
      JOIN students ON attendance.student_id = students.id 
      WHERE attendance.student_id = ?
    `
    : `
      SELECT attendance.*, students.name AS student_name 
      FROM attendance 
      JOIN students ON attendance.student_id = students.id
    `;

  db.query(query, studentId ? [studentId] : [], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new attendance record
router.post('/', authorizeRole("instructor"),(req, res) => {
  const { student_id, date, day_of_week, status } = req.body;

  if (!student_id || !date || !day_of_week || !status) {
    return res.status(400).json({ error: "All fields are required" });
  }
   
  const sql = `
    INSERT INTO attendance (student_id, date, day_of_week, status)
    VALUES (?, ?, ?, ?)`;

  db.query(sql, [student_id, date, day_of_week, status], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    const userId = req.user.id; 
 
  db.query("SELECT name FROM users WHERE id = ?", [userId], (err, nameResult) => {
    if (err) return res.status(500).json({ error: "Failed to fetch name" });

    const instructorName = nameResult[0]?.name || "Instructor";
    // notification logic
    const formattedDate = new Date(date).toDateString();
    const message = `${instructorName} added an attendance record on ${formattedDate}`;
    const type = 'personal';

    // Step 1: Insert into notifications table
    db.query(
      "INSERT INTO notifications (message, type) VALUES (?, ?)",
      [message, type],
      (err2, notifResult) => {
        if (!err2) {
          const notifId = notifResult.insertId;
          // Step 2: Link notification to the specific student
          db.query(
            "INSERT INTO user_notifications (user_id, notification_id) VALUES (?, ?)",
            [student_id, notifId],
             (linkErr)=>{
               if (!linkErr) {
           const io = req.app.get("io");
           const users = req.app.get("users");

          const receiverSocketId = users.get(Number(student_id));
                
           if (receiverSocketId) {
              io.to(receiverSocketId).emit("newNotification", {
                id: notifId,
                message,
                type,
                created_at: new Date(),
                read_status: 0,
              });
            }

          }
        
            }
          );
        }
      }
    );
     });
    res.json({ message: "Attendance record added successfully", id: result.insertId});
 
})
});


// Update an existing attendance record
router.put('/:id', authorizeRole("instructor"), (req, res) => {
  const { status } = req.body;
  const attendanceId = req.params.id;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  
  const fetchDateSql = "SELECT date, student_id FROM attendance WHERE id = ?";
  db.query(fetchDateSql, [attendanceId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Attendance record not found" });

    const rawDate = results[0].date;
    const studentId = results[0].student_id;
  
    const formattedDate = new Date(rawDate).toDateString();
     
    const updateSql = `
      UPDATE attendance 
      SET status = ?
      WHERE id = ?`;

    db.query(updateSql, [status, attendanceId], (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
       const userId = req.user.id; 
   
  db.query("SELECT name FROM users WHERE id = ?", [userId], (err, nameResult) => {
    if (err) return res.status(500).json({ error: "Failed to fetch name" });

    const instructorName = nameResult[0]?.name || "Instructor";
      // notification logic
      const message = `${instructorName} updated an attendance record on ${formattedDate}`;
      const type = 'personal';

      db.query(
        "INSERT INTO notifications (message, type) VALUES (?, ?)",
        [message, type],
        (err2, notifResult) => {
          if (!err2) {
            const notifId = notifResult.insertId;
            db.query(
              "INSERT INTO user_notifications (user_id, notification_id) VALUES (?, ?)",
              [studentId, notifId],
              (linkErr)=>{
               if (!linkErr) {
            const io = req.app.get("io");
           const users = req.app.get("users");
      
          const receiverSocketId = users.get(Number(studentId));
         
           if (receiverSocketId) {
              io.to(receiverSocketId).emit("newNotification", {
                id: notifId,
                message,
                type,
                created_at: new Date(),
                read_status: 0,
              });
            }
          }
        
            }
            );
          }
        }
      );
      });
      res.json({ message: "Attendance record updated successfully" });
   
  })
  });
});


// Delete an attendance record
router.delete('/:id', authorizeRole("instructor"), (req, res) => {
  const attendanceId = req.params.id;

  db.query("DELETE FROM attendance WHERE id = ?", [attendanceId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ message: "Attendance record deleted successfully" });
  });
});

module.exports = router;
