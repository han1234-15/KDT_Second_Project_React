import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { caxios } from "../../config/config.js";
import GridLayout, { WidthProvider } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Card, Button, Calendar, List, message } from "antd";
import {
  BellFill,
  EnvelopeFill,
  CalendarFill as CalendarIcon,
} from "react-bootstrap-icons";

import styles from "./Home.module.css";
import LeaveModal from "../WorkExpense/LeaveModal";

const ResponsiveGridLayout = WidthProvider(GridLayout);

/* ---------------------- 시간 포맷팅 ---------------------- */
const formatDateTime = (timeString) => {
  if (!timeString) return "-- : --";
  const [hour, minute] = timeString.split(":");
  let h = parseInt(hour, 10);
  const ampm = h < 12 ? "오전" : "오후";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${ampm} ${String(h).padStart(2, "0")}:${minute}`;
};

function Home() {
  const navigate = useNavigate();

  // ✅ 상태 정의
  const [layout, setLayout] = useState([]);
  const [mails, setMails] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);
  const [workDays, setWorkDays] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [status, setStatus] = useState("대기중");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // ✅ 현재 로그인 사용자 정보 (네 코드 유지)
  const [myInfo, setMyInfo] = useState(null);

  // ✅ 시계 리렌더
  const [, setClockTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------------- 서버 데이터 ---------------------- */
  const fetchHomeData = useCallback(async () => {
    try {
      const [mailRes, leaveRes, workRes, todayRes] = await Promise.all([
        caxios.get("/mail/recent"),
        caxios.get("/leave/count"),
        caxios.get("/attendance/workdays"),
        caxios.get("/attendance/today"),
      ]);

      setMails(mailRes.data);
      setLeaveCount(parseFloat(leaveRes.data) || 0);
      setWorkDays(parseInt(workRes.data) || 0);

      const d = todayRes.data;
      const startStatus = d.startStatus ?? d.STARTSTATUS;
      const endStatus = d.endStatus ?? d.ENDSTATUS;
      const startTime = d.startTime ?? d.STARTTIME;
      const endTime = d.endTime ?? d.ENDTIME;

      setCheckIn(formatDateTime(startTime));
      setCheckOut(formatDateTime(endTime));

      if (!startStatus) setStatus("대기중");
      else if (startStatus === "late" && !endStatus) setStatus("지각");
      else if (startStatus === "normal" && !endStatus) setStatus("근무중");
      else setStatus(endStatus === "nocheck" ? "퇴근미체크" : "퇴근");
    } catch (err) {
      console.error("홈 데이터 로드 실패:", err);
      message.error("홈 데이터를 불러오지 못했습니다.");
    }
  }, []);

  // ✅ 출퇴근 처리
  const handleCheckIn = async (e) => {
    e.stopPropagation();
    if (checkIn !== "-- : --") return message.info("이미 출근 처리되었습니다 ✅");
    if (!window.confirm("출근 처리하시겠습니까?")) return;
    await caxios.post("/attendance/checkin");
    fetchHomeData();
  };

  const handleCheckOut = async (e) => {
    e.stopPropagation();
    if (checkIn === "-- : --") return message.warning("출근 먼저 처리해주세요!");
    if (checkOut !== "-- : --") return message.info("이미 퇴근 처리되었습니다 🏁");
    if (!window.confirm("퇴근 처리하시겠습니까?")) return;
    await caxios.post("/attendance/checkout");
    fetchHomeData();
  };

  // ✅ 로그인 사용자 & 홈데이터 불러오기
  useEffect(() => {
    caxios.get("/member/me").then((res) => setMyInfo(res.data));
    fetchHomeData();
  }, [fetchHomeData]);

  /* ---------------------- Layout (네 코드 유지) ---------------------- */
  const defaultLayout = [
    { i: "notice", x: 0, y: 0, w: 12, h: 4 },
    { i: "mail", x: 0, y: 4, w: 4, h: 3 },
    { i: "vacation", x: 4, y: 4, w: 4, h: 3 },
    { i: "calendar", x: 0, y: 7, w: 8, h: 7 },
    { i: "profile", x: 8, y: 0, w: 4, h: 6 },
  ];

  const saveLayoutToServer = useCallback(async (newLayout) => {
    try {
      await caxios.post("/homeLayout/save", {
        layout: JSON.stringify(newLayout),
      });
    } catch (err) {
      console.error("레이아웃 저장 실패:", err);
    }
  }, []);

  const handleLayoutChange = useCallback(
    (newLayout) => {
      setLayout(newLayout);
      saveLayoutToServer(newLayout);
    },
    [saveLayoutToServer]
  );

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await caxios.get("/homeLayout");
        if (res.data && res.data.layout_Json) {
          setLayout(JSON.parse(res.data.layout_Json));
        } else {
          setLayout(defaultLayout);
        }
      } catch {
        setLayout(defaultLayout);
      }
    };
    fetchLayout();
  }, []);

  return (
    <div className={styles.container}>
      <ResponsiveGridLayout
        layout={layout}
        cols={12}
        rowHeight={60}
        margin={[16, 16]}
        draggableHandle=".drag-area"
        isResizable
        isDraggable
        compactType={null}
        preventCollision={true}
        onDragStop={handleLayoutChange}
        onResizeStop={handleLayoutChange}
      >

        {/* 공지 */}
        <div key="notice">
          <Card title={<span className={`${styles.cardHeader} drag-area`}><BellFill /> 공지사항</span>} className={styles.card}>
            <List dataSource={["공지 1", "공지 2", "공지 3"]} renderItem={(i) => <List.Item>{i}</List.Item>} />
          </Card>
        </div>

        {/* 메일 */}
        <div key="mail">
          <Card title={<span className={`${styles.cardHeader} drag-area`}><EnvelopeFill /> 최근 메일 ({mails.length})</span>} className={styles.card}>
            <div style={{ maxHeight: "100px", overflowY: "auto", paddingRight: "8px" }}>
              <List
                dataSource={mails}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/mail/mailview", { state: { mail: item } })}
                  >
                    발신자 : {item.senderName} <br />
                    제목 : {item.title} <br />
                    날짜 : {item.sendDateStr}
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </div>

        {/* 잔여 휴가 (네 코드 유지) */}
        <div key="vacation">
          <Card title={<span className={`${styles.cardHeader} drag-area`}><CalendarIcon /> 잔여 휴가</span>} className={styles.card}>
            <p>남은 휴가 : <b>{leaveCount}일</b></p>
            <Button type="primary" onClick={() => setIsLeaveModalOpen(true)}>
              휴가 신청
            </Button>
          </Card>
        </div>

        {/* 달력 */}
        <div key="calendar">
          <Card title={<span className={`${styles.cardHeader} drag-area`} >📅 일정 달력</span>} className={styles.card}>
            <Calendar fullscreen={false} />
          </Card>
        </div>

        {/* 출퇴근 */}
        <div key="profile">

          <Card title={<span className={`${styles.cardHeader} drag-area`} >🚪 출퇴근</span>} className={`${styles.card} `}>

            <div className={styles.clockHeader}>
              <span>출퇴근</span>
            </div>

            <div className={styles.liveClock}>{new Date().toLocaleTimeString("ko-KR")}</div>

            <div className={styles.workActions}>
              <button className={`${styles.clockBtn} ${styles.start}`} onClick={handleCheckIn}>
                출근
              </button>
              <button className={`${styles.clockBtn} ${styles.end}`} onClick={handleCheckOut}>
                퇴근
              </button>
            </div>

            <div className={styles.timeLog}>
              <div><b>출근</b> {checkIn}</div>
              <div><b>퇴근</b> {checkOut}</div>
              <div><b>근무일수</b> {workDays}일</div>
            </div>
          </Card>
        </div>
      </ResponsiveGridLayout >

      {/* ✅ 사장 여부 전달 유지 */}
      < LeaveModal
        open={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)
        }
        refresh={fetchHomeData}
        applicant={myInfo}
      />
    </div >
  );
}

export default Home;
