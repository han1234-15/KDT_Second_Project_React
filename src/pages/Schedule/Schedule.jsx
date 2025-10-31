import React, { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import styles from "./Schedule.module.css";
import { caxios } from "../../config/config";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { message } from "antd";
import dayjs from "dayjs";
import ScheduleAddModal from "./ScheduleAddModal";
import ScheduleEditModal from "./ScheduleEditModal";
import ScheduleViewModal from "./ScheduleViewModal";

const Schedule = () => {
  const { isModalOpen, setIsModalOpen } = useOutletContext();
  const { category } = useParams();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // FullCalendar 이벤트 클릭 -> 상세 모달
  const handleEventClick = (info) => {
    const ev = info.event;
    const p = ev.extendedProps || {};
    const normalized = {
      seq: ev.id,
      category: String(p.category ?? p.calendarType ?? "1"),
      title: ev.title || "",
      content: p.content || "",
      startAt: p.startAt ? p.startAt : ev.start,
      endAt: p.endAt ? p.endAt : ev.end,
      place: p.place || p.location || "",
      color: p.color || ev.backgroundColor || "#6BB5FF",
      importantYn: p.importantYn || "N",
      created_id: p.created_id || "",
      updated_id: p.updated_id || "",
      createdAt: p.createdAt || "",
      updatedAt: p.updatedAt || "",
    };
    setSelectedEvent(normalized);
    setIsViewOpen(true);
  };

  // 빈 날짜 클릭 -> 추가 모달
  const handleDateClick = (info) => {
    setSelectedEvent({
      startAt: dayjs(info.date),
      endAt: dayjs(info.date).add(1, "hour"),
      category: "1",
      color: "#6BB5FF",
      importantYn: "N",
      title: "",
      content: "",
      place: "",
    });
    setIsAddOpen(true);
  };

  // 삭제
  const handleDelete = (seq) => {
    if (!window.confirm("해당 일정을 삭제하시겠습니까?")) return;
    caxios
      .delete(`/schedule/${seq}`)
      .then(() => {
        setEvents((prev) => prev.filter((e) => String(e.id) !== String(seq)));
        setIsViewOpen(false);
        message.success("일정이 삭제되었습니다.");
      })
      .catch(() => message.error("삭제 실패"));
  };

  // 추가/수정 성공 시 캘린더 즉시 반영
const upsertEvent = (payload) => {
  if (!payload) return;

  // 날짜·필드 정규화
  const mapped = {
    id: payload.id || payload.seq,
    title: payload.title,
    start: payload.startAt || payload.start,
    end: payload.endAt || payload.end,
    backgroundColor: payload.color || "#6BB5FF",
    extendedProps: { ...payload },
  };

  setEvents((prev) => {
    // 현재 탭 필터와 일치하는지 확인
    const matchesCurrentCategory =
      category === "all" ||
      (category === "important" && payload.importantYn === "Y") ||
      (category !== "important" && String(payload.category) === String(category));

    let next = [...prev];
    const idx = next.findIndex((e) => String(e.id) === String(mapped.id));

    if (idx >= 0) {
      if (matchesCurrentCategory) next[idx] = mapped;
      else next.splice(idx, 1);
    } else {
      if (matchesCurrentCategory) next.push(mapped);
    }
    return [...next];
  });
};


  useEffect(() => {
  if (isModalOpen) {
    setSelectedEvent({
      startAt: dayjs(),
      endAt: dayjs().add(1, "hour"),
      category: "1",
      color: "#6BB5FF",
      importantYn: "N",
      title: "",
      content: "",
      place: "",
    });
    setIsAddOpen(true);
    setIsModalOpen(false);
  }
}, [isModalOpen]);

  // 전체 로드
  useEffect(() => {
    caxios.get("/schedule/all").then((resp) => {
      let data = resp.data || [];
      if (category === "important") {
        data = data.filter((d) => d.importantYn === "Y");
      } else if (category !== "all") {
        data = data.filter((d) => String(d.category) === String(category));
      }
      const mapped = data.map((d) => ({
        id: d.seq,
        title: d.title,
        start: d.startAt,
        end: d.endAt,
        backgroundColor: d.color || "#6BB5FF",
        extendedProps: { ...d },
      }));
      setEvents(mapped);
    });
  }, [category]);

  return (
    <div className={styles.container}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
        locale="ko"
        events={events}
        selectable
        eventClick={handleEventClick}
        dateClick={handleDateClick}
      />

      {/* 추가 모달 */}
      <ScheduleAddModal
        isOpen={isAddOpen}
        initialData={selectedEvent}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newEvent) => {
          upsertEvent(newEvent);
          setIsAddOpen(false);
        }}
      />

      {/* 수정 모달 */}
      <ScheduleEditModal
        isOpen={isEditOpen}
        initialData={selectedEvent}
        onClose={() => {
          setIsEditOpen(false);
          // 수정 취소 시 상세 보기로 복귀(데이터 유지)
          setTimeout(() => setIsViewOpen(true), 0);
        }}
        onSuccess={(newEvent) => {
          upsertEvent(newEvent);
          setIsEditOpen(false);
          // 수정 후 상세 보기로 복귀
          setSelectedEvent(newEvent);
          setIsViewOpen(true);
        }}
      />

      {/* 상세 모달 */}
      <ScheduleViewModal
        open={isViewOpen}
        event={selectedEvent}
        onClose={() => setIsViewOpen(false)}
        onDelete={() => handleDelete(selectedEvent.seq)}
        onEdit={(eventData) => {
          // 순서 중요: 먼저 데이터 고정 -> 다음 렌더에서 수정 모달 오픈
          setIsViewOpen(false);
          setSelectedEvent(eventData);
          setTimeout(() => setIsEditOpen(true), 0);
        }}
      />
    </div>
  );
};

export default Schedule;
