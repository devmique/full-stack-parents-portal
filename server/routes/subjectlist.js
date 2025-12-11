import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  db.query("SELECT COUNT(*) AS count FROM subjects;", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0]);
  });
});

export default router
