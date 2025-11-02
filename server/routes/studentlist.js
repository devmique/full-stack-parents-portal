const express = require('express');
const router = express.Router();
const db = require('../db');
const { authorizeRole } = require('../middleware/authMiddleware');

router.get("/count", authorizeRole("admin", "instructor"), (req, res) => {
  const { course, program, year } = req.query;

  let sql = `
    SELECT COUNT(*) AS count
    FROM students
    JOIN courses ON students.course_id = courses.id
    JOIN programs ON students.program_id = programs.id
    WHERE 1=1
  `;

  const params = [];

  if (course && course !== "All") {
    sql += " AND courses.course_name = ?";
    params.push(course);
  }

  if (program && program !== "All") {
    sql += " AND programs.program_name = ?";
    params.push(program);
  }

  if (year && year !== "All") {
    sql += " AND students.year_level = ?";
    params.push(year);
  }

  db.query(sql, params, (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

router.get("/count/mycourse", authorizeRole("parent"), (req, res) => {
  const userId = req.user.id;


    const sql = `
    SELECT COUNT(*) AS count
    FROM students
    WHERE program_id = (
      SELECT program_id FROM students WHERE parent_id = ?
    )
    AND course_id = (
      SELECT course_id FROM students WHERE parent_id = ?
    )
    AND year_level = (
      SELECT year_level FROM students WHERE parent_id = ?
    )
  `;

  db.query(sql, [userId, userId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows[0]);
  });
});



module.exports = router;



