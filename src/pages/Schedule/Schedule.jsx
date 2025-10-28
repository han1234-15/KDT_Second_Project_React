import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./Schedule.module.css";
import { caxios } from "../../config/config";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Input, Button, Select, DatePicker, TimePicker, message } from "antd";
import dayjs from "dayjs";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const { Option } = Select;

const Schedule = () => {
  const { isModalOpen, setIsModalOpen } = useOutletContext();

  const [events, setEvents] = useState([]);
  const [important, setImportant] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: dayjs(),
    endDate: dayjs(),
    startTime: dayjs("09:00", "HH:mm"),
    endTime: dayjs("09:00", "HH:mm"),
    content: "",
    calendarType: "1",
    location: "",
    color: "#6bb5ff",
  });

  const colorOptions = [
    "#ff6b6b", "#ffb56b", "#fff06b", "#6bff8d",
    "#6bb5ff", "#8a8a9f", "#b06bff",
  ];

  /** ✅ 일정 추가 모달 열기 */
  const handleDateClick = (info) => {
    // 다른 모달 닫기
    if (isViewModalOpen) setIsViewModalOpen(false);

    // 🔥 완전 초기화 (기존 데이터 전부 제거)
    setNewEvent({
      title: "",
      startDate: dayjs(info.dateStr),
      endDate: dayjs(info.dateStr),
      startTime: dayjs("09:00", "HH:mm"),
      endTime: dayjs("09:00", "HH:mm"),
      content: "",
      calendarType: "1",
      location: "",
      color: "#6bb5ff",
    });
    setImportant(false);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  /** ✅ 일정 저장 */
  const handleSave = () => {
    if (!newEvent.title) return alert("제목을 입력하세요.");

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

   caxios
  .post("/schedule", payload)
  .then((resp) => {
    const newSchedule = {
      id: resp.data, // ✅ resp.data.seq → resp.data 로 변경
      title: newEvent.title,
      start: payload.startAt,
      end: payload.endAt,
      backgroundColor: newEvent.color,
      extendedProps: { ...payload },
    };
    setEvents((prev) => [...prev, newSchedule]);
    setIsModalOpen(false);
    message.success("일정이 추가되었습니다.");
  })
  .catch((err) => console.error(err));
  };

  /** ✅ 일정 클릭 (상세보기) */
  const handleEventClick = (info) => {
    const event = info.event;
    const props = event.extendedProps;

    setSelectedEvent({
      seq: event.id,
      title: event.title,
      startDate: dayjs(event.start),
      endDate: dayjs(event.end),
      startTime: dayjs(event.start),
      endTime: dayjs(event.end),
      content: props?.content || "",
      calendarType: props?.category || "1",
      location: props?.place || "",
      color: props?.color || "#6bb5ff",
      importantYn: props?.importantYn || "N",
    });
    setImportant(props?.importantYn === "Y");
    setIsEditMode(false);
    setIsViewModalOpen(true);
  };

  /** ✅ 일정 수정 저장 */
  const handleUpdate = () => {
    if (!selectedEvent.title) return message.warning("제목을 입력하세요.");

    const payload = {
      category: selectedEvent.calendarType,
      title: selectedEvent.title,
      content: selectedEvent.content,
      startAt: selectedEvent.startDate
        .hour(selectedEvent.startTime.hour())
        .minute(selectedEvent.startTime.minute())
        .toISOString(),
      endAt: selectedEvent.endDate
        .hour(selectedEvent.endTime.hour())
        .minute(selectedEvent.endTime.minute())
        .toISOString(),
      place: selectedEvent.location,
      color: selectedEvent.color,
      importantYn: important ? "Y" : "N",
      updated_id: "testUser",
    };

    caxios
      .put(`/schedule/${selectedEvent.seq}`, payload)
      .then(() => {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEvent.seq
              ? {
                  ...e,
                  title: selectedEvent.title,
                  start: payload.startAt,
                  end: payload.endAt,
                  backgroundColor: selectedEvent.color,
                  extendedProps: { ...payload },
                }
              : e
          )
        );
        message.success("일정이 수정되었습니다.");
        setIsEditMode(false);
        setIsViewModalOpen(false);
      })
      .catch(() => message.error("수정 실패"));
  };

  /** ✅ 일정 삭제 */
  const handleDelete = () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    caxios
      .delete(`/schedule/${selectedEvent.seq}`)
      .then(() => {
        setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.seq));
        message.success("일정이 삭제되었습니다.");
        setIsViewModalOpen(false);
      })
      .catch(() => message.error("삭제 실패"));
  };

  useEffect(() => {
  caxios
    .get("/schedule") // 서버에서 전체 일정 목록 불러오기
    .then((resp) => {
      // 서버에서 오는 데이터 구조에 맞게 매핑
      const mapped = resp.data.map((item) => ({
        id: item.seq,
        title: item.title,
        start: item.startAt,
        end: item.endAt,
        backgroundColor: item.color || "#6bb5ff",
        extendedProps: {
          content: item.content,
          category: item.category,
          place: item.place,
          color: item.color,
          importantYn: item.importantYn,
        },
      }));
      setEvents(mapped);
    })
    .catch((err) => console.error("일정 불러오기 실패:", err));
}, []); // ✅ 딱 한 번만 실행

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
        editable
        selectable
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          handleEventClick(info);
        }}
        dateClick={(info) => {
          if (isViewModalOpen || isModalOpen) return;
          handleDateClick(info);
        }}
      />

      {/* ✅ 일정 추가 모달 */}
      <Modal
        width={630}
        title="일정 추가"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          // 🔥 모달 닫을 때도 초기화
          setNewEvent({
            title: "",
            startDate: dayjs(),
            endDate: dayjs(),
            startTime: dayjs("09:00", "HH:mm"),
            endTime: dayjs("09:00", "HH:mm"),
            content: "",
            calendarType: "1",
            location: "",
            color: "#6bb5ff",
          });
          setImportant(false);
        }}
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
                    className={`${styles.colorBox} ${
                      newEvent.color === color ? styles.selected : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                  />
                ))}
              </div>

              <div
                className={styles.starBox}
                onClick={() => setImportant(!important)}
                title={important ? "중요 일정으로 설정됨" : "중요 일정으로 설정"}
              >
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
              <DatePicker value={newEvent.startDate} onChange={(date) => setNewEvent({ ...newEvent, startDate: date })} />
              <TimePicker value={newEvent.startTime} onChange={(time) => setNewEvent({ ...newEvent, startTime: time })} format="HH:mm" />
              <span className={styles.tilde}>~</span>
              <DatePicker value={newEvent.endDate} onChange={(date) => setNewEvent({ ...newEvent, endDate: date })} />
              <TimePicker value={newEvent.endTime} onChange={(time) => setNewEvent({ ...newEvent, endTime: time })} format="HH:mm" />
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
          <hr />
        </div>
      </Modal>

      {/* ✅ 일정 상세/수정 모달 */}
      <Modal
        width={630}
        title={isEditMode ? "일정 수정" : "일정 상세보기"}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          !isEditMode && (
            <>
              <Button key="edit" onClick={() => setIsEditMode(true)}>
                수정
              </Button>
              <Button key="delete" danger onClick={handleDelete}>
                삭제
              </Button>
              <Button key="close" onClick={() => setIsViewModalOpen(false)}>
                닫기
              </Button>
            </>
          ),
          isEditMode && (
            <>
              <Button key="save" type="primary" onClick={handleUpdate}>
                저장
              </Button>
              <Button key="cancel" onClick={() => setIsEditMode(false)}>
                취소
              </Button>
            </>
          ),
        ]}
      >
        {selectedEvent && (
          <div className={styles.form}>
            <hr />
            {/* 기존과 동일 UI, disabled 제어만 추가 */}
            <div className={styles.row}>
              <label>캘린더</label>
              <Select
                value={selectedEvent.calendarType}
                onChange={(val) =>
                  setSelectedEvent({ ...selectedEvent, calendarType: val })
                }
                style={{ width: 510 }}
                disabled={!isEditMode}
              >
                <Option value="1">개인 일정</Option>
                <Option value="2">전사 일정</Option>
                <Option value="3">프로젝트</Option>
              </Select>
            </div>

            {/* 색상 + 별표 */}
            <div className={styles.colorRow}>
              <label>색상</label>
              <div className={styles.colorWrapper}>
                <div className={styles.colorPalette}>
                  {colorOptions.map((color) => (
                    <div
                      key={color}
                      className={`${styles.colorBox} ${selectedEvent.color === color ? styles.selected : ""
                        }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        isEditMode &&
                        setSelectedEvent({ ...selectedEvent, color })
                      }
                    />
                  ))}
                </div>

                <div
                  className={styles.starBox}
                  onClick={() => isEditMode && setImportant(!important)}
                >
                  {important ? (
                    <StarIcon className={styles.starActive} />
                  ) : (
                    <StarBorderIcon className={styles.starInactive} />
                  )}
                  <span className={styles.starText}>중요</span>
                </div>
              </div>
            </div>

            {/* 제목, 내용, 장소 등 */}
            <div className={styles.row}>
              <label>제목</label>
              <Input
                value={selectedEvent.title}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    title: e.target.value,
                  })
                }
                style={{ width: 510 }}
                disabled={!isEditMode}
              />
            </div>

            <div className={styles.row}>
              <label>일시</label>
              <div className={styles.datetimeRow}>
                <DatePicker
                  value={selectedEvent.startDate}
                  onChange={(d) =>
                    setSelectedEvent({ ...selectedEvent, startDate: d })
                  }
                  disabled={!isEditMode}
                />
                <TimePicker
                  value={selectedEvent.startTime}
                  onChange={(t) =>
                    setSelectedEvent({ ...selectedEvent, startTime: t })
                  }
                  format="HH:mm"
                  disabled={!isEditMode}
                />
                <span className={styles.tilde}>~</span>
                <DatePicker
                  value={selectedEvent.endDate}
                  onChange={(d) =>
                    setSelectedEvent({ ...selectedEvent, endDate: d })
                  }
                  disabled={!isEditMode}
                />
                <TimePicker
                  value={selectedEvent.endTime}
                  onChange={(t) =>
                    setSelectedEvent({ ...selectedEvent, endTime: t })
                  }
                  format="HH:mm"
                  disabled={!isEditMode}
                />
              </div>
            </div>

            <div className={styles.rowTopAlign}>
              <label>내용</label>
              <Input.TextArea
                value={selectedEvent.content}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    content: e.target.value,
                  })
                }
                style={{ width: 510, height: 80 }}
                disabled={!isEditMode}
              />
            </div>

            <div className={styles.row}>
              <label>장소</label>
              <Input
                value={selectedEvent.location}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    location: e.target.value,
                  })
                }
                style={{ width: 510 }}
                disabled={!isEditMode}
              />
            </div>
            <hr />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Schedule;
