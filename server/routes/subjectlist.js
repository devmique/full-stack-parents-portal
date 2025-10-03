const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/", (req, res) => {
  db.query("SELECT COUNT(*) AS count FROM subjects;", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0]);
  });
});

module.exports = router;
