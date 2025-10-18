const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorizeRole } = require('../middleware/authMiddleware');
// Get all grades
router.get('/', (req, res) => {
  const studentId = req.query.student_id; 

  const query = studentId
    ? `SELECT grades.*, students.name AS student_name 
       FROM grades 
       JOIN students ON grades.student_id = students.id 
       WHERE grades.student_id = ?`
    : `SELECT grades.*, students.name AS student_name 
       FROM grades 
       JOIN students ON grades.student_id = students.id`;

  db.query(query, studentId ? [studentId] : [], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add a new grade
router.post('/',authorizeRole("instructor"),(req, res) => {
  const { student_id, school_year, term, subject_code, subject_title, grade, units } = req.body;

  if (!student_id || !school_year || !term || !subject_code || !subject_title || !grade || !units) {
    return res.status(400).json({ error: "All fields are required" });
  }
    
  const sql = `
    INSERT INTO grades (student_id, school_year, term, subject_code, subject_title, grade, units)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [student_id, school_year, term, subject_code, subject_title, grade, units], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    const io = req.app.get("io");
    const users = req.app.get("users")
    const userId = req.user.id; 
   
    db.query("SELECT name FROM users WHERE id = ?", [userId], (err, nameResult) => {
      if (err) return res.status(500).json({ error: "Failed to fetch name" });
  
      const instructorName = nameResult[0]?.name || "Instructor";
    // notification entry
    const timestamp = new Date().toLocaleString();
    const message = `${instructorName} added a new grade for ${subject_title}. ${timestamp}`;
    const type = 'personal';

    db.query(
      "INSERT INTO notifications (message, type) VALUES (?, ?)",
      [message, type],
      (err2, notifResult) => {
        if (!err2) {
          const notifId = notifResult.insertId;
          db.query(
            "INSERT INTO user_notifications (user_id, notification_id) VALUES (?, ?)",
            [student_id, notifId], 
            (linkErr)=>{
               if (!linkErr) {
         
          const receiverSocketId = users.get(Number(student_id));
       
           if (receiverSocketId) {
            console.log("Sending notification");
              io.to(receiverSocketId).emit("newNotification", {
                id: notifId,
                message,
                type,
                created_at: new Date(),
                read_status: 0,
              });
            }
                res.json({ message: "Grade added successfully", id: result.insertId });

          }
  
            }
          );
        }
      }
    );
     });

    })
});

// Update an existing grade
router.put('/:id',authorizeRole("instructor"), (req, res) => {
  const { student_id, school_year, term, subject_code, subject_title, grade, units } = req.body;
  const gradeId = req.params.id;

  if (!school_year || !term || !subject_code || !subject_title || !grade || !units) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  const sql = `
    UPDATE grades 
    SET school_year = ?, term = ?, subject_code = ?, subject_title = ?, grade = ?, units = ?
    WHERE id = ?`;

  db.query(sql, [school_year, term, subject_code, subject_title, grade, units, gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

      const userId = req.user.id; 
   
    db.query("SELECT name FROM users WHERE id = ?", [userId], (err, nameResult) => {
      if (err) return res.status(500).json({ error: "Failed to fetch name" });
  
      const instructorName = nameResult[0]?.name || "Instructor";
// ✅ Create update notification
    const timestamp = new Date().toLocaleString();
    const message = `${instructorName} updated a grade for ${subject_title}. ${timestamp}`;
    const type = 'personal';

    db.query(
      "INSERT INTO notifications (message, type) VALUES (?, ?)",
      [message, type],
      (err2, notifResult) => {
        if (!err2) {
          const notifId = notifResult.insertId;
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
    res.json({ message: "Grade updated successfully" });

})
});

// Delete a grade
router.delete('/:id', authorizeRole("instructor"),(req, res) => {
  const gradeId = req.params.id;

  db.query("DELETE FROM grades WHERE id = ?", [gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ message: "Grade deleted successfully" });
  });
});

module.exports = router;
