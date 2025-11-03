import React, { useState } from "react";
import styles from "./MessengerFileUpload.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { caxios } from "../../config/config";

export default function MessengerFileUpload({ roomId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const token = sessionStorage.getItem("token");

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("roomId", roomId);

        await caxios.post("/api/chat/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      alert("업로드 완료");
      setFiles([]);
      onUploadComplete?.();
    } catch (err) {
      console.error("파일 업로드 중 오류:", err);
      alert("업로드 중 오류 발생");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <label
      htmlFor="fileInput"
      className={`${styles.preview} ${isDragging ? styles.active : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        id="fileInput"
        type="file"
        multiple
        className={styles.file}
        onChange={handleFileChange}
      />

      <i className={`bi bi-cloud-upload-fill ${styles.uploadIcon}`}></i>
      <p className={styles.preview_msg}>파일을 드롭하거나 클릭해서 선택</p>
      <p className={styles.preview_desc}>최대 10MB, 여러 파일 가능</p>

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((f, idx) => (
            <div key={idx} className={styles.fileItem}>
              <i className="bi bi-file-earmark-text"></i>
              <span className={styles.fileName}>{f.name}</span>
              <span className={styles.fileSize}>
                {(f.size / 1024).toFixed(1)} KB
              </span>
              <button
                className={styles.removeBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // ✅ label 클릭 이벤트 완전 차단
                  removeFile(idx);
                }}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
          ))}

          <button
            type="button"
            className={styles.uploadBtn}
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // ✅ 이 버튼도 클릭 시 label 클릭 방지
              handleUpload();
            }}
          >
            {uploading ? "업로드 중..." : "보내기"}
          </button>
        </div>
      )}
    </label>
  );
}
