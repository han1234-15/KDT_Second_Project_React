// src/components/Schedule/ScheduleViewModal.jsx
import React from "react";
import { Modal, Button } from "antd";
import styles from "./ScheduleViewModal.module.css";
import dayjs from "dayjs";

const ScheduleViewModal = ({ open, onClose, event, onEdit, onDelete }) => {
  if (!event) return null;

  // ✅ 필드 통일 (백엔드에서 오는 값과 맞춰줌)
  const start = event.startDate || event.startAt;
  const end = event.endDate || event.endAt;
  const calendar =
    event.calendarTypeName ||
    (event.category === "1"
      ? "개인 일정"
      : event.category === "2"
      ? "전사 일정"
      : event.category === "3"
      ? "프로젝트"
      : "");

  return (
    <Modal
      open={open}
      title="일정 확인"
      width={630}
      onCancel={onClose}
      footer={[
        <Button key="edit" onClick={onEdit}>
          수정
        </Button>,
        <Button key="delete" danger onClick={onDelete}>
          삭제
        </Button>,
      ]}
    >
      <hr />

      <div className={styles.container}>
        {/* 제목 + 색상 */}
        <div className={styles.row}>
          <label>제목</label>
          <div
            className={`${styles.colorBox} ${styles.selected}`}
            style={{ backgroundColor: event.color }}
          ></div>
          <div className={styles.text}>{event.title}</div>
        </div>

        {/* 일시 */}
        <div className={styles.row}>
          <label>일시</label>
          <div className={styles.text}>
            {dayjs(start).isValid()
              ? dayjs(start).format("YYYY-MM-DD HH:mm")
              : "Invalid"}
            {" ~ "}
            {dayjs(end).isValid()
              ? dayjs(end).format("YYYY-MM-DD HH:mm")
              : "Invalid"}
          </div>
        </div>

        {/* 캘린더 */}
        <div className={styles.row}>
          <label>캘린더</label>
          <div className={styles.text}>{calendar}</div>
        </div>

        {/* 내용 */}
        <div className={styles.row}>
          <label>내용</label>
          <div className={styles.textArea}>{event.content || "(내용 없음)"}</div>
        </div>

        {/* 장소 */}
        <div className={styles.row}>
          <label>장소</label>
          <div className={styles.text}>{event.location || event.place || "(장소 없음)"}</div>
        </div>
      </div>
      <hr />
    </Modal>
  );
};

export default ScheduleViewModal;
