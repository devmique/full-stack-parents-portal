import redisClient from "../redis/redisClient.js";
import express from "express";
import db from "../db.js";
import { authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// GET events (admin and parent)
router.get("/", async (req, res) => {

  try{

     const cacheKey = "calendar_events";
     
     //check cache
        
     const cachedData = await redisClient.get(cacheKey);
     if(cachedData){
      console.log("Serving from Redis cache");
      return res.json(JSON.parse(cachedData));
     }

    const sql = "SELECT * FROM calendar_events ORDER BY date ASC";
    db.query(sql, async (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch events" });

    const formatted = results.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
    }));

    //save to redis cache for 1 hour
    await redisClient.set(cacheKey, JSON.stringify(formatted),{
      EX: 3600
    });
    console.log("Cached calendar events");

    res.json(formatted);
  });
}catch(error){
    res.status(500).json({ error: "Server error" });

}

});

// POST new event (admin only)`
router.post("/", authorizeRole("admin"), async (req, res) => {
  const { title, start } = req.body;
  if (req.user.role !== "admin") return res.status(403).json({ error: "Only admins can add events" });
  if (!title || !start) return res.status(400).json({ error: "Title and start date required" });

  const date = new Date(start).toISOString().split('T')[0];
 
  const sql = "INSERT INTO calendar_events (title, date, created_by) VALUES (?, ?, ?)";
  db.query(sql, [title, date, req.user.id], async (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to create event" });
    //  Clear Redis cache
      await redisClient.del("calendar_events");
      console.log(" Calendar cache cleared after POST");

     const userId = req.user.id; 
   // Get the admin’s name
  db.query("SELECT name FROM users WHERE id = ?", [userId], (err, nameResult) => {
    if (err) return res.status(500).json({ error: "Failed to fetch admin name" });

    const adminName = nameResult[0]?.name || "Admin";
   // ✅ Step 1: Create a general notification entry
    const type = 'general';
    const message = `${adminName} posted a new event: "${title}" on ${date}.`;

    db.query("INSERT INTO notifications (message, type) VALUES (?, ?)", [message, type], (err2, notifResult) => {
      if (!err2) {
        const notifId = notifResult.insertId;

        //  Step 2: Assign notification to users
        db.query(
          "INSERT INTO user_notifications (user_id, notification_id) SELECT id, ? FROM users WHERE role IN ('parent', 'instructor', 'admin')",
          [notifId],
          (linkErr)=>{
               if (!linkErr) {
            const io = req.app.get("io");

            //  Emit real-time notification
            io.emit("newNotification", {
              id: notifId,
              message,
              type,
              created_at: new Date(),
              read_status: 0,
            });
          }
        
            }
        );
      }
    });
  });
    res.json({ id: result.insertId, title, date, message: "Event added successfully" });
  
  })
});


// DELETE event (admin only)
router.delete("/:id", authorizeRole("admin"), async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Only admins can delete events" });

  const sql = "DELETE FROM calendar_events WHERE id = ?";
  db.query(sql, [req.params.id], async (err) => {
      // Clear Redis cache
      await redisClient.del("calendar_events");
     
      console.log(" Calendar cache cleared after DELETE");
    if (err) return res.status(500).json({ error: "Failed to delete event" });
    res.json({ message: "Event deleted successfully" });
  });
});

export default router;
