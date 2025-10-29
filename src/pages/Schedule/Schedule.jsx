
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
import ScheduleViewModal from "./ScheduleViewModal";

const Schedule = () => {
  const { isModalOpen, setIsModalOpen } = useOutletContext();
  const { category } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 일정 클릭 시 상세보기 모달 열기
  const handleEventClick = (info) => {
    const event = info.event;
    const props = event.extendedProps;
    setSelectedEvent({
      seq: event.id,
      title: event.title,
      startDate: dayjs(event.start),
      endDate: dayjs(event.end),
      content: props?.content || "",
      calendarType: props?.category || "1",
      location: props?.place || "",
      color: props?.color || "#6bb5ff",
      importantYn: props?.importantYn || "N",
    });
    setIsViewModalOpen(true);
  };

  // 일정 추가 클릭 시
  const handleDateClick = (info) => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    caxios.get("/schedule/all").then((resp) => {
      let data = resp.data;
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
        backgroundColor: d.color || "#6bb5ff",
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
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale="ko"
        events={events}
        selectable
        eventClick={(info) => handleEventClick(info)}
        dateClick={(info) => handleDateClick(info)}
      />

      {/* 일정 추가 모달 (별도 컴포넌트로 분리) */}
      <ScheduleAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newEvent) => setEvents((prev) => [...prev, newEvent])}
      />

      {/* 일정 상세 모달 (별도 컴포넌트로 분리) */}
      <ScheduleViewModal
        open={isViewModalOpen}
        event={selectedEvent}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={(eventData) => {
          setIsViewModalOpen(false);
          setIsModalOpen(true);
          setSelectedEvent(eventData); // 수정용 데이터 전달
        }}
      />
    </div>
  );
};

export default Schedule;
