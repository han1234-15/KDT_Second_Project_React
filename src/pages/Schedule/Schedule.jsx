import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./Schedule.module.css";
import { caxios } from "../../config/config";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Input, Button, Select, DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const Schedule = () => {
  const { isModalOpen, setIsModalOpen } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: dayjs(),
    endDate: dayjs(),
    startTime: dayjs("09:00", "HH:mm"),
    endTime: dayjs("09:30", "HH:mm"),
    content: "",
    calendarType: "1",
    location: "",
    color: "#6bb5ff", // ✅ 기본 색상 (파랑)
  });

  const colorOptions = [
    "#ff6b6b", // 빨강
    "#ffb56b", // 주황
    "#fff06b", // 노랑
    "#6bff8d", // 연두
    "#6bb5ff", // 파랑
    "#8a8a9f", // 회색
    "#b06bff", // 보라
  ];

  const handleDateClick = (info) => {
    setNewEvent({
      ...newEvent,
      startDate: dayjs(info.dateStr),
      endDate: dayjs(info.dateStr),
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!newEvent.title) return alert("제목을 입력하세요.");

    const payload = {
      title: newEvent.title,
      start: `${newEvent.startDate.format("YYYY-MM-DD")} ${newEvent.startTime.format("HH:mm")}`,
      end: `${newEvent.endDate.format("YYYY-MM-DD")} ${newEvent.endTime.format("HH:mm")}`,
      content: newEvent.content,
      location: newEvent.location,
      calendarType: newEvent.calendarType,
      color: newEvent.color, // ✅ 색상 포함
    };

    caxios
      .post("/schedule", payload)
      .then((resp) => {
        setEvents([...events, resp.data]);
        setIsModalOpen(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className={styles.container}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale="ko"
        events={events}
        dateClick={handleDateClick}
        editable
        selectable
      />

      <Modal
        width={630}
        title="일정 추가"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            취소
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            저장
          </Button>,
        ]}
      >
        <hr />
        <div className={styles.form}>
          {/* 캘린더 */}
          <div className={styles.row}>
            <label>캘린더</label>
            <Select
              value={newEvent.calendarType}
              onChange={(val) =>
                setNewEvent({ ...newEvent, calendarType: val })
              }
              style={{ width: 510 }}
            >
              <Option value="1">내 일정</Option>
              <Option value="2">공용 일정</Option>
            </Select>
          </div>

          {/* ✅ 색상 선택 (팔레트형) */}
          <div className={styles.colorRow}>
            <label>일정 색상</label>
            <div className={styles.colorPalette}>
              {colorOptions.map((color) => (
                <div
                  key={color}
                  className={`${styles.colorBox} ${
                    newEvent.color === color ? styles.selected : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewEvent({ ...newEvent, color })}
                />
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className={styles.row}>
            <label>제목</label>
            <Input
              placeholder="제목을 입력하세요"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              style={{ width: 510 }}
            />
          </div>

          {/* 일시 */}
          <div className={styles.row}>
            <label>일시</label>
            <div className={styles.datetimeRow}>
              <DatePicker
                value={newEvent.startDate}
                onChange={(date) => setNewEvent({ ...newEvent, startDate: date })}
              />
              <TimePicker
                value={newEvent.startTime}
                onChange={(time) => setNewEvent({ ...newEvent, startTime: time })}
                format="HH:mm"
              />
              <span className={styles.tilde}>~</span>
              <DatePicker
                value={newEvent.endDate}
                onChange={(date) => setNewEvent({ ...newEvent, endDate: date })}
              />
              <TimePicker
                value={newEvent.endTime}
                onChange={(time) => setNewEvent({ ...newEvent, endTime: time })}
                format="HH:mm"
              />
            </div>
          </div>

          {/* 내용 */}
          <div className={styles.rowTopAlign}>
            <label>내용</label>
            <Input.TextArea
              placeholder="내용을 입력하세요"
              value={newEvent.content}
              onChange={(e) =>
                setNewEvent({ ...newEvent, content: e.target.value })
              }
              style={{ width: 510, height: 80 }}
            />
          </div>

          {/* 장소 */}
          <div className={styles.row}>
            <label>장소</label>
            <Input
              placeholder="장소를 입력하세요"
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
              style={{ width: 510 }}
            />
          </div>

          <hr />
        </div>
      </Modal>
    </div>
  );
};

export default Schedule;
