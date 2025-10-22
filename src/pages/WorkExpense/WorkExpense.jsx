import React, { useState, useEffect } from "react";
import "./style/WorkExpense.css";
import axios from "axios";
import { caxios } from "../../config/config";


const WorkExpense = () => {
  const [time, setTime] = useState(new Date());
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [status, setStatus] = useState("대기중");

  const [checkInbtn, setCheckInbtn] = useState(false);
  const [checkOutbtn, setCheckOutbtn] = useState(false);


  const [count, setCount] = useState({
    late: 0,
    earlyleave: 0,
    absence: 0,
    nocheck: 0,
  });

  const [leavecounts, setLeaveCounts] = useState({
    leavecount: 0
  });

  const formatDateTime = (timeString) => {
    if (!timeString) return null;

    const now = new Date();
    const [hour, minute] = timeString.split(":");

    // 날짜 형식
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");

    // 요일
    const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdayNames[now.getDay()];

    // 시간 형식
    let h = parseInt(hour, 10);
    const ampm = h < 12 ? "오전" : "오후";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;

    const formattedTime = `${ampm} ${String(h).padStart(2, "0")}:${minute}`;

    return `${year}-${month}-${date} (${weekday}) ${formattedTime}`;
  };


  //따로 뺴줘서 실시간으로 지각처리 알수있게 끔
  const fetchAttendanceCount = () => {
    caxios.get(`attendance/count`)
      .then((res) => {
        console.log("서버 응답:", res.data);

        const result = { before: 0, absence: 0, earlyleave: 0, late: 0, nocheck: 0 };

        res.data.forEach(item => {
          const key = item.STATUS?.toLowerCase();
          if (result.hasOwnProperty(key)) {
            result[key] = item.CNT;
          }
        });

        setCount(result);
      })
      .catch(err => console.error("근태 카운트 불러오기 실패:", err));
  };


  useEffect(() => {
    caxios.get("/attendance/today")
      .then(res => {
        const data = res.data;
        const startStatus = data.startStatus ?? data.STARTSTATUS ?? null;
        const endStatus = data.endStatus ?? data.ENDSTATUS ?? null;
        const startTime = data.startTime ?? data.STARTTIME ?? null;
        const endTime = data.endTime ?? data.ENDTIME ?? null;

        setCheckIn(startTime ? formatDateTime(startTime) : null);
        setCheckOut(endTime ? formatDateTime(endTime) : null);

        if (!startStatus) {

          setStatus("대기중");
          setCheckInbtn(true);
          setCheckOutbtn(false);

        } else if (startStatus === "absence") {
          // 결근 상태 (지각으로 바뀔 가능성 있음)
          setStatus("결근");
          setCheckInbtn(true);  
          setCheckOutbtn(false);

        } else if (startStatus && !endStatus) {
          // 출근은 했고 퇴근은 아직
          setStatus(startStatus === "late" ? "지각" : "근무중");
          setCheckInbtn(false);
          setCheckOutbtn(true);

        } else {
          // 퇴근 or nocheck
          setStatus(endStatus === "nocheck" ? "퇴근미체크" : "퇴근");
          setCheckInbtn(false);
          setCheckOutbtn(false);
        }

        fetchAttendanceCount();
      })
      .catch(err => console.error(err));
  }, []);




  useEffect(() => {
    const autoRefresh = setInterval(() => {

      fetchAttendanceCount();

    }, 60000);

    return () => clearInterval(autoRefresh);
  }, []);



  useEffect(() => {
    caxios.get(`leave/count`)
      .then((res) => {
        let data = res.data;
        console.log("서버 응답", res.data);
        setLeaveCounts({ leavecount: res.data || 0 });
      })
  }, [])



  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const handleCheckIn = () => {
    if (!window.confirm("정말 출근하시겠습니까?")) return;

    caxios.post("/attendance/checkin")
      .then((res) => {
        setCheckIn(formatDateTime(res.data.time));
        setStatus(res.data.status === "late" ? "지각" : "근무중");
        setCheckInbtn(false);
        setCheckOutbtn(true);
        fetchAttendanceCount();
        alert("출근 처리되었습니다.");
      })
      .catch(err => console.error("출근 실패:", err));
  };

  const handleCheckOut = () => {
    if (!window.confirm("정말 퇴근하시겠습니까?\n퇴근은 하루에 한 번만 가능합니다.")) {
      return;
    }

    caxios.post(`/attendance/checkout`)
      .then((res) => {
        setCheckOut(formatDateTime(res.data.time));
        setStatus(res.data.status === "checkout" ? "조기 퇴근" : "퇴근");
        setCheckInbtn(false);
        setCheckOutbtn(false);
        fetchAttendanceCount();
        alert("퇴근 처리되었습니다.");
      })
      .catch(err => console.error("퇴근 실패", err));
  };

  return (
    <div className="work-dashboard">
      {/* === 상단: 올해 근무 정보 === */}
      <h3 className="section-title">올해 근무 정보</h3>
      <div className="info-row">
        <fieldset className="info-box">
          <legend>근태 현황</legend>
          <div className="field-content">
            <div className="field-item"><strong>지각</strong><div>{count.late}회</div></div>
            <div className="field-item"><strong>조기퇴근</strong><div>{count.earlyleave}회</div></div>
            <div className="field-item"><strong>퇴근미체크</strong><div>{count.nocheck}회</div></div>
            <div className="field-item"><strong>결근</strong><div>{count.absence}회</div></div>
          </div>
        </fieldset>

        <fieldset className="info-box">
          <legend>휴가 현황</legend>
          <div className="field-content">
            <div className="field-item"><strong>잔여 휴가</strong><div>{leavecounts.leavecount}회</div></div>
          </div>
          <div className="field-footer">
            <button className="link-btn">휴가 현황</button>
            <button className="link-btn">휴가 신청</button>
          </div>
        </fieldset>

        <fieldset className="info-box">
          <legend>근무시간</legend>
          <div className="field-content">
            <div className="field-item"><strong>근무일수</strong><div>0일</div></div>
            <div className="field-item"><strong>총근무시간</strong><div>0시간</div></div>
            <div className="field-item"><strong>보정정근</strong><div>0시간</div></div>
          </div>
        </fieldset>
      </div>

      {/* === 하단: 오늘 근무현황 === */}
      <h3 className="section-title">오늘 근무현황</h3>
      <div className="info-row">
        {/* 근무계획 */}
        <fieldset className="info-box">
          <legend>근무계획</legend>
          <div className="calendar-box">
            <div className="calendar-date">
              <div className="month">10월</div>
              <div className="day">16</div>
              <div className="weekday">목요일</div>
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
            <div className="time-logs">
              <div><strong>상태</strong> {status}</div>
            </div>
          </div>
        </fieldset>

        {/* 근무현황 */}
        <fieldset className="info-box">
          <legend>근무현황</legend>
          <div className="empty-state">
            <div><strong>출근</strong> {checkIn || "-- : -- : --"}</div>
            <br></br>
            <div><strong>퇴근</strong> {checkOut || "-- : -- : --"}</div>
          </div>

        </fieldset>
      </div>
    </div>
  );
};

export default WorkExpense;
