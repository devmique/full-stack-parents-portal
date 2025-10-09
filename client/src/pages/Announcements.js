import React, { useEffect, useState } from 'react';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import axios from 'axios';
import "../styles/Announcements.css"
const Announcements = () => {
  const token = sessionStorage.getItem("token");
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const currentUser = JSON.parse(sessionStorage.getItem("user")) || {};
 const isAdmin = currentUser?.role === 'admin';


  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/announcements' 
          ,{
         headers: {
          Authorization: `Bearer ${token}`
        }}
      );
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePost = async () => {
     if (!title.trim()) {
    alert("Title is required.");
    return;
  }
  if (!content.trim()) {
    alert("Content is required.");
    return;
  }
    try {
      await axios.post('http://localhost:5000/api/announcements', { title, content},{
          headers: {authorization: `Bearer ${token}` }
       });
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

const handleDelete = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/announcements/${id}`
        ,{
         headers: {
          Authorization: `Bearer ${token}`
        }}
    );
    fetchAnnouncements();
  } catch (err) {
    console.error('Delete failed:', err);
  }
};


  return (
    <div className="announcements-container">
      <h1 className="page-title">Announcements</h1>

      {isAdmin && (
        <div className="announcement-form">
          <input
            type="text"
            placeholder="Title"
        
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <ReactQuill
            theme="snow"
            placeholder="Write your announcement..."
            value={content}
            onChange={setContent}
            style={{backgroundColor:"white"}}
          />
          <button
            
            onClick={handlePost}
          >
            Post Announcement
          </button>
        </div>
      )}

      <div className="announcement-list">
         {announcements.length === 0 ? (
          <p style={{fontSize: "20px"}}> No announcements available at the moment.</p>
        ) : (
        announcements.map((a) => (
          <div key={a.id} className="announcement-card">
            <div className="announcement-date">{new Date(a.date_posted).toLocaleString()}</div>
            <h2 className="announcement-title">{a.title}</h2>
            
             {/* ✅ Render formatted HTML safely */}
           <div
             className="announcement-content"
             dangerouslySetInnerHTML={{ __html: a.content }}
           ></div>
            {isAdmin && (
              <button
               className="delete-btn"
                onClick={() => handleDelete(a.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default Announcements;


