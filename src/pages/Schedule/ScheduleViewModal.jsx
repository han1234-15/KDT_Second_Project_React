import React from "react";
import { Modal, Button } from "antd";
import styles from "./ScheduleViewModal.module.css";
import dayjs from "dayjs";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import useAuthStore from "../../store/authStore";

const ScheduleViewModal = ({ open, onClose, event, onEdit, onDelete }) => {
  if (!event) return null;

  const start = event.startAt;
  const end = event.endAt;

  const calendar =
    event.calendarTypeName ||
    (event.category === "1" && "개인 일정") ||
    (event.category === "2" && "전사 일정") ||
    (event.category === "3" && "프로젝트");

  const isImportant = event.importantYn === "Y";

  return (
    <Modal
    centered
      open={open}
      width={630}
      destroyOnHidden 
      onCancel={onClose}
      title={
        <div className={styles.headerTitle}>
          <span>일정 확인</span>
          <div className={isImportant ? styles.headerImportant : styles.headerNotImportant}>
            {isImportant ? <StarIcon className={styles.starActive} /> : <StarBorderIcon className={styles.starInactive} />}
            <span className={styles.starText}>중요</span>
          </div>
        </div>
      }
      footer={[
        <Button key="edit" onClick={() => onEdit(event)}>수정</Button>,
        <Button key="delete" danger onClick={() => onDelete(event.seq)}>삭제</Button>,
      ]}
    >
      <hr />
      <div className={styles.container}>
        <div className={styles.row}>
          <label>제목</label>
          <div className={styles.text}>{event.title}</div>
        </div>

        <div className={styles.row}>
          <label>일시</label>
          <div className={styles.text}>
            {dayjs(start).isValid() ? dayjs(start).format("YYYY-MM-DD HH:mm") : "Invalid"} ~{" "}
            {dayjs(end).isValid() ? dayjs(end).format("YYYY-MM-DD HH:mm") : "Invalid"}
          </div>
        </div>

        <div className={styles.row}>
          <label>캘린더</label>
          <div className={`${styles.colorBox} ${styles.selected}`} style={{ backgroundColor: event.color }} />
          <div className={styles.text}>{calendar}</div>
        </div>

        <div className={styles.row}>
          <label>내용</label>
          <div className={styles.textArea}>{event.content || "( 내용 없음 )"}</div>
        </div>

        <div className={styles.row}>
          <label>장소</label>
          <div className={styles.text}>{event.place || event.location || "( 장소 없음 )"}</div>
        </div>
      </div>
      <hr />
    </Modal>
  );
};

export default ScheduleViewModal;
