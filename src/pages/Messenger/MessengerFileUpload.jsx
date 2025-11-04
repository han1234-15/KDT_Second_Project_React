// src/components/chat/MessengerFileUpload.jsx
import React, { useState } from "react";
import styles from "./MessengerFileUpload.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { caxios } from "../../config/config";

/**
 * 파일 첨부 컴포넌트
 * - 드래그·드롭 또는 파일 선택 시 로컬 목록에만 추가
 * - "보내기" 버튼을 눌렀을 때만 서버 업로드 및 상위 콜백(onUploadComplete) 실행
 * - 업로드 성공 시 ChatRoom에서 sendMessage()를 통해 채팅방으로 전송됨
 */
export default function MessengerFileUpload({ roomId, onUploadComplete }) {
  // 업로드 전 로컬에 담아두는 파일 목록
  const [files, setFiles] = useState([]);
  // 드래그 상태 표시용
  const [isDragging, setIsDragging] = useState(false);
  // 업로드 진행 중 여부
  const [uploading, setUploading] = useState(false);

  /** 파일 선택(input[type=file]) 처리 */
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files); // FileList를 배열로 변환
    setFiles((prev) => [...prev, ...selected]);   // 기존 목록 뒤에 추가
  };

  /** 드래그 영역 위로 파일이 들어올 때 */
  const handleDragOver = (e) => {
    e.preventDefault();     // 기본 동작(파일 열기 등)을 막음
    e.stopPropagation();    // 이벤트 전파를 막아 window.drop으로 가지 않게 함
    setIsDragging(true);    // 드래그 상태 표시 on
  };

  /** 드래그 영역을 벗어났을 때 */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();    // 상위 엘리먼트로 이벤트가 전달되지 않게 함
    setIsDragging(false);   // 드래그 상태 표시 off
  };

  /** 파일을 드롭했을 때 - 업로드하지 않고 로컬 목록에만 추가 */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();    // 전역 window.drop으로 이벤트가 전파되는 것을 막음
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]); // 업로드는 하지 않음
  };

  /**
   * 보내기 버튼 클릭 시 실행
   * - 로컬에 담긴 파일들을 서버에 업로드
   * - 업로드가 성공하면 상위 컴포넌트(ChatRoom)에 콜백(onUploadComplete) 전달
   * - 업로드 완료 후 목록 초기화
   */
  const handleUpload = async () => {
    if (files.length === 0) return;  // 업로드할 파일이 없으면 종료
    if (!roomId) {
      alert("채팅방 정보가 없습니다.");
      return;
    }

    setUploading(true);
    try {
      const token = sessionStorage.getItem("token");

      // 선택된 파일들을 순차 업로드
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("roomId", roomId);

        const resp = await caxios.post("/api/chat/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        // 업로드 성공 시 ChatRoom으로 메타데이터 전달
        if (resp.status === 200 && resp.data) {
          onUploadComplete?.(resp.data);
        }
      }

      // 업로드 완료 후 로컬 목록 초기화
      setFiles([]);
    } catch (err) {
      console.error("파일 업로드 중 오류:", err);
      alert("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  /** 업로드 전 로컬 목록에서 파일 삭제 */
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <label
      htmlFor="fileInput"
      className={`${styles.preview} ${isDragging ? styles.active : ""}`}
      onDragOver={handleDragOver}    // 드래그 상태
      onDragLeave={handleDragLeave}  // 드래그 종료
      onDrop={handleDrop}            // 파일 드롭 시
    >
      {/* 파일 선택 input */}
      <input
        id="fileInput"
        type="file"
        multiple
        className={styles.file}
        onChange={handleFileChange}
      />

      {/* 기본 안내 문구 */}
      <i className={`bi bi-cloud-upload-fill ${styles.uploadIcon}`}></i>
      <p className={styles.preview_msg}>파일을 드롭하거나 클릭해서 선택</p>
      <p className={styles.preview_desc}>최대 10MB, 여러 파일 가능</p>

      {/* 선택된 파일 목록 */}
      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((f, idx) => (
            <div key={idx} className={styles.fileItem}>
              <i className="bi bi-file-earmark-text"></i>
              <span className={styles.fileName}>{f.name}</span>
              <span className={styles.fileSize}>
                {(f.size / 1024).toFixed(1)} KB
              </span>
              {/* 파일 제거 버튼 */}
              <button
                className={styles.removeBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // 상위 label 클릭 이벤트로 전파되지 않게 방지
                  removeFile(idx);
                }}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
          ))}

          {/* 보내기 버튼: 이 시점에서만 실제 업로드 및 채팅 전송 실행 */}
          <button
            type="button"
            className={styles.uploadBtn}
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // 클릭 이벤트 상위 전파 방지
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
