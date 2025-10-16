const express = require('express');
const router = express.Router();
const db = require('../db'); 

// GET contacts 
router.get('/contacts', (req, res) => {
  const userId = req.query.userId;
  const role = req.query.role;
 
  let query = "";
  if (role === 'admin' || role === 'instructor') {
    query = "SELECT id, name, email FROM users WHERE role = 'parent'";
  } else {
    query = "SELECT id, name, email FROM users WHERE role = 'admin' OR role = 'instructor'";
  }

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// GET conversation between two users
router.get('/conversation', (req, res) => {
  const { sender_id, receiver_id } = req.query;

  const query = `
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ? )
       OR (sender_id = ?  AND receiver_id = ? )
    ORDER BY timestamp ASC
  `;

  db.query(query, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
    
  });
});

module.exports = router;
