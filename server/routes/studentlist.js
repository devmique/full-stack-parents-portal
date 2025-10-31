const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorizeRole } = require('../middleware/authMiddleware');

router.get("/count", authorizeRole("admin", "instructor"), (req, res) => {
  db.query("SELECT COUNT(*) AS count FROM students", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows[0]);
  });
});

router.get("/count/mycourse", authorizeRole("parent"), (req, res) => {
  const userId = req.user.id;


  const sql = `
    SELECT COUNT(*) AS count
    FROM students
    WHERE course_id = (
      SELECT course_id FROM students WHERE parent_id = ?
    )
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows[0]);
  });
});


module.exports = router;



