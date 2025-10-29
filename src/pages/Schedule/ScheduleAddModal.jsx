
// src/pages/Schedule/ScheduleAddModal.jsx
import React, { useState } from "react";
import { Modal, Input, Button, Select, DatePicker, TimePicker, message } from "antd";
import dayjs from "dayjs";
import { caxios } from "../../config/config";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import styles from "./Schedule.module.css";

const { Option } = Select;

const ScheduleAddModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const isEdit = !!initialData;
  const [important, setImportant] = useState(initialData?.importantYn === "Y" || false);
  const [newEvent, setNewEvent] = useState(
    initialData || {
      title: "",
      startDate: dayjs(),
      endDate: dayjs(),
      startTime: dayjs("09:00", "HH:mm"),
      endTime: dayjs("09:00", "HH:mm"),
      content: "",
      calendarType: "1",
      location: "",
      color: "#6bb5ff",
    }
  );

  const colorOptions = [
    "#ff6b6b", "#ffb56b", "#fff06b", "#6bff8d",
    "#6bb5ff", "#8a8a9f", "#b06bff",
  ];

  /** 저장 or 수정 */
  const handleSave = () => {
    if (!newEvent.title) return message.warning("제목을 입력하세요.");

    const payload = {
      category: newEvent.calendarType,
      title: newEvent.title,
      content: newEvent.content,
      startAt: newEvent.startDate
        .hour(newEvent.startTime.hour())
        .minute(newEvent.startTime.minute())
        .toISOString(),
      endAt: newEvent.endDate
        .hour(newEvent.endTime.hour())
        .minute(newEvent.endTime.minute())
        .toISOString(),
      place: newEvent.location,
      color: newEvent.color,
      importantYn: important ? "Y" : "N",
      created_id: "testUser",
    };

    const apiCall = isEdit
      ? caxios.put(`/schedule/${initialData.seq}`, payload)
      : caxios.post("/schedule", payload);

    apiCall
      .then((resp) => {
        const id = isEdit ? initialData.seq : resp.data;
        const newSchedule = {
          id,
          title: payload.title,
          start: payload.startAt,
          end: payload.endAt,
          backgroundColor: payload.color,
          extendedProps: payload,
        };
        message.success(isEdit ? "수정되었습니다." : "등록되었습니다.");
        onSuccess(newSchedule);
        onClose();
      })
      .catch(() => message.error(isEdit ? "수정 실패" : "등록 실패"));
  };

  return (
    <Modal
      width={630}
      title={isEdit ? "일정 수정" : "일정 추가"}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>취소</Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          {isEdit ? "수정" : "저장"}
        </Button>,
      ]}
    >
      <div className={styles.form}>
        <div className={styles.row}>
          <label>캘린더</label>
          <Select
            value={newEvent.calendarType}
            onChange={(val) => setNewEvent({ ...newEvent, calendarType: val })}
            style={{ width: 510 }}
          >
            <Option value="1">개인 일정</Option>
            <Option value="2">전사 일정</Option>
            <Option value="3">프로젝트</Option>
          </Select>
        </div>

        <div className={styles.colorRow}>
          <label>색상</label>
          <div className={styles.colorWrapper}>
            <div className={styles.colorPalette}>
              {colorOptions.map((color) => (
                <div
                  key={color}
                  className={`${styles.colorBox} ${newEvent.color === color ? styles.selected : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewEvent({ ...newEvent, color })}
                />
              ))}
            </div>
            <div className={styles.starBox} onClick={() => setImportant(!important)}>
              {important ? (
                <StarIcon className={styles.starActive} />
              ) : (
                <StarBorderIcon className={styles.starInactive} />
              )}
              <span className={styles.starText}>중요</span>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <label>제목</label>
          <Input
            placeholder="제목을 입력하세요"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            style={{ width: 510 }}
          />
        </div>

        <div className={styles.row}>
          <label>일시</label>
          <div className={styles.datetimeRow}>
            <DatePicker value={newEvent.startDate} onChange={(d) => setNewEvent({ ...newEvent, startDate: d })} />
            <TimePicker value={newEvent.startTime} onChange={(t) => setNewEvent({ ...newEvent, startTime: t })} format="HH:mm" />
            <span className={styles.tilde}>~</span>
            <DatePicker value={newEvent.endDate} onChange={(d) => setNewEvent({ ...newEvent, endDate: d })} />
            <TimePicker value={newEvent.endTime} onChange={(t) => setNewEvent({ ...newEvent, endTime: t })} format="HH:mm" />
          </div>
        </div>

        <div className={styles.rowTopAlign}>
          <label>내용</label>
          <Input.TextArea
            placeholder="내용을 입력하세요"
            value={newEvent.content}
            onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
            style={{ width: 510, height: 80 }}
          />
        </div>

        <div className={styles.row}>
          <label>장소</label>
          <Input
            placeholder="장소를 입력하세요"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            style={{ width: 510 }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleAddModal;
