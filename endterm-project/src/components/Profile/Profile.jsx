import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { uploadProfilePicture } from "../../services/updateUserProfile";
import "./Profile.css";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [preview, setPreview] = useState(null); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // синхронизируем preview с user.photoURL
  useEffect(() => {
    if (user?.photoURL) {
      setPreview(user.photoURL);
    }
  }, [user?.photoURL]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const compressFile = (file) =>
    new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("../../workers/imageCompressor.js", import.meta.url),
        { type: "module" }
      );

      worker.onmessage = (e) => {
        const base64 = e.data;
        worker.terminate();
        if (!base64) return reject("Compression failed");
        resolve(base64);
      };

      worker.onerror = (err) => {
        worker.terminate();
        reject(err);
      };

      worker.postMessage(file);
    });

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      const base64 = await compressFile(selectedFile);
      const downloadURL = await uploadProfilePicture(base64, user.uid);

      setPreview(downloadURL);

      if (refreshUser) await refreshUser();

      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-card">
        <img
          src={preview || "https://via.placeholder.com/150"}
          alt="Profile"
          className="profile-img"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        <button onClick={() => fileInputRef.current.click()}>
          Choose Photo
        </button>

        <button onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>

        <p>{user?.email}</p>
      </div>
    </div>
  );
};

export default Profile;
