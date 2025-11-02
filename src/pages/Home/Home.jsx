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
  Cursor,
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

  /* ---------------------- Layout 관리 ---------------------- */
  const defaultLayout = [
    { i: "notice", x: 0, y: 0, w: 12, h: 4 },
    { i: "mail", x: 0, y: 4, w: 4, h: 3 },
    { i: "vacation", x: 4, y: 4, w: 4, h: 3 },
    { i: "calendar", x: 0, y: 7, w: 8, h: 7 },
    { i: "profile", x: 8, y: 0, w: 4, h: 6 },
  ];

  const saveLayoutToServer = useCallback(async (newLayout) => {
    console.log("💾 서버 저장:", newLayout);
    try {
      await caxios.post("/homeLayout/save", {
        layout: JSON.stringify(newLayout),
      });
    } catch (err) {
      console.error("레이아웃 저장 실패:", err);
    }
  }, []);

  // ✅ 즉시 서버 저장 (1초 지연 제거)
  const handleLayoutChange = useCallback(
    (newLayout) => {
      setLayout(newLayout);
      saveLayoutToServer(newLayout);
    },
    [saveLayoutToServer]
  );

  // ✅ 새로고침 시 마지막 layout 서버 전송 (caxios.baseURL 사용)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (layout?.length > 0) {
        const baseURL = caxios.defaults.baseURL || "";
        navigator.sendBeacon(
          `${baseURL}/homeLayout/save`,
          JSON.stringify({ layout: JSON.stringify(layout) })
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [layout]);

  // ✅ 초기 레이아웃 불러오기
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await caxios.get("/homeLayout");
        console.log("📦 레이아웃 불러오기:", res.data);
        if (res.data && res.data.layout_Json) {
          setLayout(JSON.parse(res.data.layout_Json));
        } else {
          setLayout(defaultLayout);
        }
      } catch (err) {
        console.error("레이아웃 불러오기 실패:", err);
        setLayout(defaultLayout);
      }
    };
    fetchLayout();
    fetchHomeData();
  }, [fetchHomeData]);

  /* ---------------------- 카드 렌더 ---------------------- */
  const renderCard = (key, title, content) => (
    <div key={key}>
      <Card
        title={<span className={`${styles.cardHeader} drag-area`}>{title}</span>}
        className={styles.card}
      >
        {content}
      </Card>
    </div>
  );

  /* ---------------------- JSX ---------------------- */
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
        {renderCard("notice", <><BellFill /> 공지사항</>, (
          <List
            dataSource={["공지 1", "공지 2", "공지 3"]}
            renderItem={(i) => <List.Item>{i}</List.Item>}
          />
        ))}

        {renderCard("mail", <><EnvelopeFill /> 최근 메일 ({mails.length})</>, (
          <div
            style={{
              maxHeight: "100px",     // 원하는 높이 설정
              overflowY: "auto",      // 세로 스크롤 활성화
              paddingRight: "8px",    // 스크롤바 여백 확보
            }}
          >
            <List
              dataSource={mails}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/mail/mailview", { state: { mail: item } })

                  }
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6f7ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  발신자 : {item.senderName} <br></br>
                   제목: {item.title} <br></br> 
                   날짜: {item.sendDateStr}
                </List.Item>
              )}
            />
          </div>
        ))}


        {renderCard("vacation", <><CalendarIcon /> 잔여 휴가</>, (
          <>
            <p>남은 휴가: <b>{leaveCount}일</b></p>
            <Button
              type="primary"
              disabled={leaveCount <= 0}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setIsLeaveModalOpen(true)}
            >
              휴가 신청
            </Button>
          </>
        ))}

        {renderCard("calendar", "📅 일정 달력", <Calendar fullscreen={false} />)}

        {renderCard("profile", "⏰ 출퇴근", (
          <div>
            <div className={styles.clockHeader}>
              <span>출퇴근</span>
              <span className={styles.clockDate}>
                {new Date().toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  weekday: "short",
                })}
              </span>
            </div>

            <div className={styles.statusBadge}>
              <div>
                {status === "대기중" && "OFF"}
                {status === "근무중" && "ON"}
                {status === "지각" && "LATE"}
                {status === "퇴근" && "DONE"}
              </div>
            </div>

            <div className={styles.liveClock}>
              {new Date().toLocaleTimeString("ko-KR")}
            </div>

            <div className={styles.workActions}>
              <button
                className={`${styles.clockBtn} ${styles.start}`}
                onClick={handleCheckIn}
                disabled={status !== "대기중"}
              >
                출근
              </button>
              <button
                className={`${styles.clockBtn} ${styles.end}`}
                onClick={handleCheckOut}
                disabled={status !== "근무중" && status !== "지각"}
              >
                퇴근
              </button>
            </div>

            <div className={styles.timeLog}>
              <div><b>출근</b> {checkIn}</div>
              <div><b>퇴근</b> {checkOut}</div>
              <div><b>근무일수</b> {workDays}일</div>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>

      <LeaveModal
        open={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        refresh={fetchHomeData}
      />
    </div>
  );
}

export default Home;
