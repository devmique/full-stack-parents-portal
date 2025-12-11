import express from "express";
import db from "../db.js";
import { authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Get all grades
router.get('/', (req, res) => {
  const studentId = req.query.student_id; 

  const query = studentId
    ? `SELECT grades.*, students.name AS student_name 
       FROM grades 
       JOIN students ON grades.student_id = students.id 
       WHERE grades.student_id = ? AND grades.status = 'approved'`
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
    INSERT INTO grades (student_id, school_year, term, subject_code, subject_title, grade, units, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`;

  db.query(sql, [student_id, school_year, term, subject_code, subject_title, grade, units], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
     res.json({ message: 'Grades sent successfully'})

    })
});

// Admin approval
router.put('/status/:id', authorizeRole("admin"), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check current grade
  db.query("SELECT * FROM grades WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (rows.length === 0) return res.status(404).json({ error: "Grade not found" });

    const grade = rows[0];

    // Stop if not pending
    if (grade.status !== "pending") {
      return res.status(400).json({
        error: "Status cannot be changed anymore. It is already final."
      });
    }

    // Update status
    db.query("UPDATE grades SET status = ? WHERE id = ?", [status, id], (err) => {
      if (err) return res.status(500).json({ error: "Database error" });

      // Only send notification if approved
      if (status === "approved") {
        const io = req.app.get("io");
        const users = req.app.get("users");

        const student_id = grade.student_id;
        const subject_title = grade.subject_title;

        // Get admin name
        db.query("SELECT name FROM users WHERE id = ?", [req.user.id], (err, nameResult) => {
          if (err) return res.status(500).json({ error: "Failed to fetch name" });

          const adminName = nameResult[0]?.name || "Admin";
          const message = `${adminName} updated a grade for ${subject_title}.`;
          const type = "personal";

          // Insert notification
          db.query(
            "INSERT INTO notifications (message, type) VALUES (?, ?)",
            [message, type],
            (err2, notifResult) => {
              if (err2) return res.status(500).json({ error: "Notification error" });

              const notifId = notifResult.insertId;

              // Assign notification to student
              db.query(
                "INSERT INTO user_notifications (user_id, notification_id) VALUES (?, ?)",
                [student_id, notifId],
                (linkErr) => {
                  if (linkErr) return res.status(500).json({ error: "Link error" });

                  // WebSocket push
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

                  res.json({
                    message: "Status updated successfully",
                    updatedStatus: status,
                  });
                }
              );
            }
          );
        });
      } else {
        // If not approved (declined), just return success
        res.json({ message: "Status updated successfully", updatedStatus: status });
      }
    });
  });
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
    SET school_year = ?, term = ?, subject_code = ?, subject_title = ?, grade = ?, units = ?, status = 'pending'
    WHERE id = ?`;

  db.query(sql, [school_year, term, subject_code, subject_title, grade, units, gradeId], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
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

export default router;
