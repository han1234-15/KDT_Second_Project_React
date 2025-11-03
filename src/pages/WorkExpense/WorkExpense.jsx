import React, { useState, useEffect } from "react";
import "./style/WorkExpense.css";
import { useNavigate } from "react-router-dom";
import { caxios } from "../../config/config";
import LeaveModal from "./LeaveModal";

const WorkExpense = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [status, setStatus] = useState("대기중");
  const [checkInbtn, setCheckInbtn] = useState(false);
  const [checkOutbtn, setCheckOutbtn] = useState(false);
  const [workTime, setWorkTime] = useState(null);
  const [loginUser, setLoginUser] = useState(null);
  const [workDays, setWorkDays] = useState(0);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const [leavecounts, setLeaveCounts] = useState({ leavecount: 0 });
  const [count, setCount] = useState({
    late: 0,
    earlyleave: 0,
    nocheck: 0,
    absence: 0
  });

  // ✅ 오늘 날짜 정보 함수
  const getTodayInfo = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const weekday = weekdayNames[now.getDay()];
    return { month, day, weekday };
  };

  const [todayInfo, setTodayInfo] = useState(getTodayInfo());

  // ✅ 실시간 시계 + 날짜 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setTodayInfo(getTodayInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 로그인 사용자 조회
  useEffect(() => {
    caxios.get("/member/me")
      .then(res => setLoginUser(res.data))
      .catch(err => console.error("로그인 사용자 정보 조회 실패", err));
  }, []);

  const calcWorkTime = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return null;
    return `${Math.floor(diff / 60)}시간 ${diff % 60}분`;
  };

  const formatDateTime = (timeString) => {
    if (!timeString) return null;
    const now = new Date();
    const [hour, minute] = timeString.split(":");
    const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdayNames[now.getDay()];
    let h = parseInt(hour, 10);
    const ampm = h < 12 ? "오전" : "오후";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} (${weekday}) ${ampm} ${String(h).padStart(2, "0")}:${minute}`;
  };

  // ✅ 근태 Today 조회
  const fetchToday = async () => {
    try {
      const res = await caxios.get("/attendance/today");
      const data = res.data;

      const startStatus = data.startStatus ?? data.STARTSTATUS ?? null;
      const endStatus = data.endStatus ?? data.ENDSTATUS ?? null;
      const startTime = data.startTime ?? data.STARTTIME ?? null;
      const endTime = data.endTime ?? data.ENDTIME ?? null;

      setCheckIn(startTime ? formatDateTime(startTime) : null);
      setCheckOut(endTime ? formatDateTime(endTime) : null);
      setWorkTime(startTime && endTime ? calcWorkTime(startTime, endTime) : (startTime ? "근무중" : null));

      if (!startStatus) {
        setStatus("대기중"); setCheckInbtn(true); setCheckOutbtn(false);
      } else if (startStatus === "absence") {
        setStatus("결근"); setCheckInbtn(true); setCheckOutbtn(false);
      } else if (startStatus === "late" && !endStatus) {
        setStatus("지각"); setCheckInbtn(false); setCheckOutbtn(true);
      } else if (startStatus === "normal" && !endStatus) {
        setStatus("근무중"); setCheckInbtn(false); setCheckOutbtn(true);
      } else {
        setStatus(endStatus === "nocheck" ? "퇴근미체크" : "퇴근");
        setCheckInbtn(false); setCheckOutbtn(false);
      }

      fetchAttendanceCount();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendanceCount = async () => {
    try {
      const res = await caxios.get(`attendance/count`);
      const result = { before: 0, absence: 0, earlyleave: 0, late: 0, nocheck: 0 };
      res.data.forEach(item => {
        const key = item.STATUS?.toLowerCase();
        if (result[key] != null) result[key] = item.CNT;
      });
      setCount(result);
    } catch (err) {
      console.error("근태 카운트 불러오기 실패:", err);
    }
  };

  const fetchRemainLeave = async () => {
    try {
      const res = await caxios.get("/leave/count");
      setLeaveCounts({ leavecount: parseFloat(res.data) || 0 });
    } catch (err) { }
  };

  const fetchWorkDays = async () => {
    try {
      const res = await caxios.get("/attendance/workdays");
      setWorkDays(parseInt(res.data) || 0);
    } catch (err) { }
  };

  const refresh = () => {
    fetchToday();
    fetchAttendanceCount();
    fetchRemainLeave();
    fetchWorkDays();
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const autoRefresh = setInterval(refresh, 10000);
    return () => clearInterval(autoRefresh);
  }, []);

  const showLeaveModal = () => {
    if (leavecounts.leavecount <= 0) return alert("잔여 연차가 없습니다.");
    setIsLeaveModalOpen(true);
  };

  const handleCheckIn = async () => {
    if (!window.confirm("정말 출근하시겠습니까?")) return;
    await caxios.post("/attendance/checkin");
    refresh();
    alert("출근 처리되었습니다.");
  };

  const handleCheckOut = async () => {
    if (!window.confirm("정말 퇴근하시겠습니까?")) return;
    await caxios.post("/attendance/checkout");
    refresh();
    alert("퇴근 처리되었습니다.");
  };

  return (
    <div className="work-dashboard">
      {/* === 상단: 올해 근무 정보 === */}
      <h3 className="section-title">올해 근무 정보</h3>
      <div className="info-row">
        {/* 근태 현황 */}
        <fieldset className="info-box">
          <legend>근태 현황</legend>
          <div className="field-content">
            <div className="field-item"><strong>지각</strong><div>{count.late}회</div></div>
            <div className="field-item"><strong>조기퇴근</strong><div>{count.earlyleave}회</div></div>
            <div className="field-item"><strong>퇴근미체크</strong><div>{count.nocheck}회</div></div>
            <div className="field-item"><strong>결근</strong><div>{count.absence}회</div></div>
          </div>
        </fieldset>

        {/* 휴가 현황 */}
        <fieldset className="info-box">
          <legend>휴가 현황</legend>
          <div className="field-content">
            <div className="field-item">
              <strong>잔여 휴가</strong>
              <div>{leavecounts.leavecount}일</div>
            </div>
          </div>
          <div className="field-footer">
            <button className="link-btn" onClick={() => navigate("/leave")}>휴가 현황</button>
            <button className="link-btn" onClick={showLeaveModal}>휴가 신청</button>
            {loginUser && (
              <LeaveModal
                open={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                refresh={refresh}
                applicant={loginUser}
              />
            )}
          </div>
        </fieldset>

        {/* 근무시간 */}
        <fieldset className="info-box">
          <legend>근무시간</legend>
          <div className="field-content">
            <div className="field-item"><strong>근무일수</strong><div>{workDays}일</div></div>
            <div className="field-item"><strong>총근무시간</strong><div>{workTime || "0시간 0분"}</div></div>
          </div>
        </fieldset>
      </div>

      {/* === 하단: 오늘 근무현황 === */}
      <h3 className="section-title">오늘 근무현황</h3>
      <div className="info-row">

        {/* ✅ 근무계획 날짜 자동 표시 */}
        <fieldset className="info-box">
          <legend>근무계획</legend>
          <div className="calendar-box">
            <div className="calendar-date">
              <div className="month">{todayInfo.month}월</div>
              <div className="day">{todayInfo.day}</div>
              <div className="weekday">{todayInfo.weekday}</div>
            </div>
            <div className="time-text">9시 출근</div>
            <div className="time-range">09:00 ~ 18:00 (소정 8시간)</div>
            <div className="work-buttons">
              <button>내 근무계획</button>
              <button>임장근무신청</button>
              <button>휴(무)근무신청</button>
            </div>
          </div>
        </fieldset>

        {/* 근무체크 */}
        <fieldset className="info-box">
          <legend>근무체크</legend>
          <div className="check-section">
            <div className="clock">{time.toLocaleTimeString("ko-KR")}</div>
            <div className="check-buttons">
              <button className="in" onClick={handleCheckIn} disabled={!checkInbtn}>출근하기</button>
              <button className="out" onClick={handleCheckOut} disabled={!checkOutbtn}>퇴근하기</button>
            </div>
            <hr />
            <div className="time-logs">
              <div><strong>상태:</strong> {status}</div>
            </div>
          </div>
        </fieldset>

        {/* 근무현황 */}
        <fieldset className="info-box">
          <legend>근무현황</legend>
          <div className="empty-state">
            <div><strong>출근</strong> {checkIn || "-- : -- : --"}</div>
            <br />
            <div><strong>퇴근</strong> {checkOut || "-- : -- : --"}</div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default WorkExpense;
