import React, { useState, useEffect } from "react";
import "./style/WorkExpense.css";
import axios from "axios";
import { caxios } from "../../config/config";


const WorkExpense = () => {
  const [time, setTime] = useState(new Date());
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [status, setStatus] = useState("대기중");


  const[count,setCount]=useState({
    late:0,
    earlyleave:0,
    absence:0,
    nocheck:0,
  });

useEffect(() => {
  caxios.get(`attendance/count`)
    .then((res) => {
      console.log("서버 응답:", res.data);

      const result = { before: 0, absence: 0, earlyleave: 0, late: 0 ,nocheck: 0};

      res.data.forEach(item => {
        const key = item.status?.replace(/\s+/g, "_").toLowerCase(); 
        if (result.hasOwnProperty(key)) {
          result[key] = item.cnt;
        }
      });

      setCount(result);
    })
    .catch(err => console.error("근태 카운트 불러오기 실패:", err));
}, []);





  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    setCheckIn(time.toLocaleTimeString("ko-KR"));
    setStatus("근무중");
  };

  const handleCheckOut = () => {
    setCheckOut(time.toLocaleTimeString("ko-KR"));
    setStatus("퇴근");
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
            <div className="field-item"><strong>잔여 휴가</strong><div>17일</div></div>
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
              <button className="in" onClick={handleCheckIn}>출근하기</button>
              <button className="out" onClick={handleCheckOut}>퇴근하기</button>
            </div>
            <div className="time-logs">
              <div><strong>출근</strong> {checkIn || "-- : -- : --"}</div>
              <div><strong>퇴근</strong> {checkOut || "-- : -- : --"}</div>
              <div><strong>상태</strong> {status}</div>
            </div>
          </div>
        </fieldset>

        {/* 근무현황 */}
        <fieldset className="info-box">
          <legend>근무현황</legend>
          <div className="empty-state">
            {status === "근무중"
              ? "현재 근무 중입니다."
              : status === "퇴근"
              ? "오늘 근무를 마쳤습니다."
              : "근무현황이 없습니다."}
          </div>
          <div className="field-footer">
            <button className="link-btn">근무체크 수정</button>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default WorkExpense;
