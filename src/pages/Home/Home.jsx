import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { caxios } from "../../config/config.js";
import GridLayout, { WidthProvider } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Card, Button, Calendar, List } from "antd";
import {
  BellFill,
  EnvelopeFill,
  CalendarFill as CalendarIcon,
} from "react-bootstrap-icons";

import styles from "./Home.module.css";
import LeaveModal from "../WorkExpense/LeaveModal";

const ResponsiveGridLayout = WidthProvider(GridLayout);

const formatDateTime = (timeString) => {
  if (!timeString) return null;
  const [hour, minute] = timeString.split(":");
  let h = parseInt(hour, 10);
  const ampm = h < 12 ? "오전" : "오후";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${ampm} ${String(h).padStart(2, "0")}:${minute}`;
};

function Home() {
  const navigate = useNavigate();

  const [leaveCount, setLeaveCount] = useState(0);
  const [workDays, setWorkDays] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [status, setStatus] = useState("대기중");
  const [mails, setMails] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // ✅ 현재 로그인 사용자 정보
  const [myInfo, setMyInfo] = useState(null);

  const [, setClockTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRemainLeave = async () => {
    const res = await caxios.get("/leave/count");
    setLeaveCount(parseFloat(res.data) || 0);
  };

  const fetchWorkDays = async () => {
    const res = await caxios.get("/attendance/workdays");
    setWorkDays(parseInt(res.data) || 0);
  };

  const fetchToday = async () => {
    const res = await caxios.get("/attendance/today");
    const d = res.data;
    const startStatus = d.startStatus ?? d.STARTSTATUS ?? null;
    const endStatus = d.endStatus ?? d.ENDSTATUS ?? null;
    const startTime = d.startTime ?? d.STARTTIME ?? null;
    const endTime = d.endTime ?? d.ENDTIME ?? null;

    setCheckIn(startTime ? formatDateTime(startTime) : null);
    setCheckOut(endTime ? formatDateTime(endTime) : null);

    if (!startStatus) setStatus("대기중");
    else if (startStatus === "late" && !endStatus) setStatus("지각");
    else if (startStatus === "normal" && !endStatus) setStatus("근무중");
    else setStatus(endStatus === "nocheck" ? "퇴근미체크" : "퇴근");
  };

  const handleCheckIn = async (e) => {
    e.stopPropagation();
    if (checkIn) return alert("이미 출근 처리되었습니다 ✅");
    if (!window.confirm("출근 처리하시겠습니까?")) return;
    await caxios.post("/attendance/checkin");
    fetchToday();
    fetchWorkDays();
  };

  const handleCheckOut = async (e) => {
    e.stopPropagation();
    if (!checkIn) return alert("출근 먼저 처리해주세요!");
    if (checkOut) return alert("이미 퇴근 처리되었습니다 🏁");
    if (!window.confirm("퇴근 처리하시겠습니까?")) return;
    await caxios.post("/attendance/checkout");
    fetchToday();
    fetchWorkDays();
  };

  useEffect(() => {
    // ✅ 로그인 사용자 정보 불러오기
    caxios.get("/member/me").then(res => setMyInfo(res.data));

    caxios.get("/mail/recent").then((resp) => setMails(resp.data));
    fetchRemainLeave();
    fetchWorkDays();
    fetchToday();
  }, []);

  const layout = [
    { i: "notice", x: 0, y: 0, w: 12, h: 4 },
    { i: "mail", x: 0, y: 4, w: 4, h: 3 },
    { i: "vacation", x: 4, y: 4, w: 4, h: 3 },
    { i: "calendar", x: 0, y: 7, w: 8, h: 9 },
    { i: "profile", x: 8, y: 0, w: 4, h: 10 },
  ];

  return (
    <div className={styles.container}>
      <ResponsiveGridLayout layout={layout} cols={12} rowHeight={50} margin={[16, 16]} draggableHandle=".drag-area">

        {/* 공지 */}
        <div key="notice">
          <Card title={<span className={`${styles.cardHeader} drag-area`}><BellFill /> 공지사항</span>} className={styles.card}>
            <List dataSource={["공지 1", "공지 2", "공지 3"]} renderItem={(i) => <List.Item>{i}</List.Item>} />
          </Card>
        </div>

        {/* 메일 */}
        <div key="mail">
          <Card title={<span className={`${styles.cardHeader} drag-area`}><EnvelopeFill /> 최근 메일 ({mails.length})</span>} className={styles.card}>
            <List dataSource={mails} renderItem={(item) => (
              <List.Item onClick={() => navigate("/mail/mailview", { state: { mail: item } })}>
                {item.senderName} - {item.title}
              </List.Item>
            )}/>
          </Card>
        </div>

        {/* ✅ 잔여 휴가 → 사장도 보임 */}
        <div key="vacation">
          <Card title={<span className={`${styles.cardHeader} drag-area`}><CalendarIcon /> 잔여 휴가</span>} className={styles.card}>
            <p>남은 휴가 : <b>{leaveCount}일</b></p>

            <Button
              type="primary"
              onMouseDown={(e)=>e.stopPropagation()}
              onClick={() => setIsLeaveModalOpen(true)}
            >
              휴가 신청
            </Button>
          </Card>
        </div>

        {/* 달력 */}
        <div key="calendar">
          <Card title={<span className="drag-area">📅 일정 달력</span>} className={styles.card}>
            <Calendar fullscreen={false} />
          </Card>
        </div>

        {/* 출퇴근 */}
        <div key="profile">
          <Card className={`${styles.card} ${styles.clockCard}`}>
            <div className={styles.clockHeader}>
              <span>출퇴근</span>
              <span className={styles.clockDate}>
                {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", weekday:"short" })}
              </span>
            </div>

            <div className={styles.statusBadge}>
              {status === "대기중" && "OFF"}
              {status === "근무중" && "ON"}
              {status === "지각" && "LATE"}
              {status === "퇴근" && "DONE"}
            </div>

            <div className={styles.liveClock}>
              {new Date().toLocaleTimeString("ko-KR")}
            </div>

            <div className={styles.workActions}>
              <button className={`${styles.clockBtn} ${styles.start}`} onClick={handleCheckIn} disabled={status !== "대기중"}>출근</button>
              <button className={`${styles.clockBtn} ${styles.end}`} onClick={handleCheckOut} disabled={status !== "근무중" && status !== "지각"}>퇴근</button>
            </div>

            <div className={styles.timeLog}>
              <div><b>출근</b> {checkIn || "-- : --"}</div>
              <div><b>퇴근</b> {checkOut || "-- : --"}</div>
              <div><b>근무일수</b> {workDays}일</div>
            </div>
          </Card>
        </div>

      </ResponsiveGridLayout>

      {/*  사장 여부 LeaveModal 로 전달 */}
    <LeaveModal
    open={isLeaveModalOpen}
    onClose={() => setIsLeaveModalOpen(false)}
    refresh={fetchRemainLeave}
    applicant={myInfo}   
/>

    </div>
  );
}

export default Home;
