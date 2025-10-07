import React, { useState } from "react";
import axios from "axios";
import "../styles/ProfileUpload.css";
import CircularProgress from '@mui/material/CircularProgress';
const ProfileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    setUploading(true);
    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/upload-profile-pic", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.profilePic) {
        const updatedProfilePic = response.data.profilePic;

        // ✅ Save new profile picture to sessionStorage
        const user = JSON.parse(sessionStorage.getItem("user")) || {};
        const updatedUser = { ...user, profilePic: updatedProfilePic };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        // ✅ Update parent component immediately
        onUploadSuccess(updatedProfilePic);

        alert("Profile picture updated!");
        window.location.reload();
      }
    } catch (error) {
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-upload">
      
      <input type="file" onChange={handleFileChange} />
      <button className="uploadPfp"onClick={handleUpload} disabled={uploading}>
        {uploading ?  <CircularProgress size="15px" color="white" /> : "Upload Profile Picture"}
      </button>
    </div>
  );
};

export default ProfileUpload;

