import React, { useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { uploadProfilePicture } from "../../services/updateUserProfile";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    // Создаём worker напрямую для Vite
    const worker = new Worker(new URL("../../workers/imageCompressor.js", import.meta.url), {
      type: "module",
    });

    worker.postMessage(file);

    worker.onmessage = async (e) => {
      const compressedBlob = e.data;
      const compressedFile = new File([compressedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      await uploadProfilePicture(compressedFile, user.uid);

      setUploading(false);
      worker.terminate();

      alert("Profile picture updated!");
    };
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-card simple-profile">
        <div className="profile-photo">
          <img
            src={user?.photoURL || "https://via.placeholder.com/150"}
            alt="Profile"
          />
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload new photo"}
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </div>

        <div className="profile-info">
          <h2>{user?.displayName || "User"}</h2>
          <p className="email">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
