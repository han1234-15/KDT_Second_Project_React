import React, { useState } from "react";
import styles from "./MessengerFileUpload.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";

/**
 * MessengerFileUpload
 * - 파일 선택 / 드래그 앤 드롭
 * - 업로드 전 파일 목록 표시
 * - "보내기" 버튼 클릭 시 서버 업로드
 */
export default function MessengerFileUpload({ roomId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 파일 선택
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  // 드래그 앤 드롭
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

  // 업로드 실행
  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const token = sessionStorage.getItem("token");

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("roomId", roomId);

        const resp = await fetch("/api/chat/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!resp.ok) throw new Error("파일 업로드 실패");
      }

      alert("업로드 완료");
      setFiles([]);
      onUploadComplete?.();
    } catch (err) {
      console.error(err);
      alert("업로드 중 오류 발생");
    } finally {
      setUploading(false);
    }
  };

  // 선택한 파일 개별 삭제
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`${styles.preview} ${isDragging ? styles.active : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        className={styles.file}
        onChange={handleFileChange}
      />
      <i className={`bi bi-cloud-upload-fill ${styles.uploadIcon}`}></i>
      <p className={styles.preview_msg}>파일을 드롭하거나 클릭해서 선택</p>
      <p className={styles.preview_desc}>최대 10MB, 여러 파일 가능</p>

      {/* 파일 목록 표시 */}
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
                onClick={() => removeFile(idx)}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
          ))}

          {/* 업로드 버튼 */}
          <button
            className={styles.uploadBtn}
            disabled={uploading}
            onClick={handleUpload}
          >
            {uploading ? "업로드 중..." : "보내기"}
          </button>
        </div>
      )}
    </div>
  );
}
