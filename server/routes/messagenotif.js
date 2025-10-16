const express = require('express');
const router = express.Router();
const db = require('../db');

// GET notifications for a specific user
router.get('/', (req, res) => {
  const userId = req.query.userId;

  const query = `SELECT * FROM messagenotif WHERE user_id = ? ORDER BY created_at DESC`;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// MARK all notifications as read for a user
router.put('/mark-all-read', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing userId in request body." });
  }

  const updateQuery = `UPDATE messagenotif SET read_status = 1 WHERE user_id = ?`;

  db.query(updateQuery, [userId], (err, result) => {
    if (err) {
      console.error("Error updating notification read status:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.sendStatus(200);
  });
});


module.exports = router;
