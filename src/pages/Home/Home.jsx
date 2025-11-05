import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { caxios } from "../../config/config.js";
import { ranks } from "../../config/options.js";
import GridLayout, { WidthProvider } from "react-grid-layout";
import defaultProfile from "../../assets/images/defaultProfile.png";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import locale from "antd/es/calendar/locale/ko_KR";      

import { Card, Button, Calendar, List, message, Divider, Table, Tag } from "antd";
import {
  BellFill,
  EnvelopeFill,
  CalendarFill as CalendarIcon,
  MegaphoneFill,
  PersonFill,
  PersonVcardFill,
  Repeat,
  SuitcaseLgFill,
  PersonWorkspace,
  AirplaneFill,
} from "react-bootstrap-icons";

import styles from "./Home.module.css";
import LeaveModal from "../WorkExpense/LeaveModal";

dayjs.locale("ko");   
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

  // 상태 정의
  const [layout, setLayout] = useState([]);
  const [mails, setMails] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);
  const [workDays, setWorkDays] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [status, setStatus] = useState("대기중");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [mySchedules, setMySchedules] = useState([]); // 일정ㄴ

  // 현재 로그인 사용자 정보
  const [myInfo, setMyInfo] = useState(null);

  // 시계 리렌더
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

  // 출퇴근 처리
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

  // 로그인 사용자 & 홈데이터 불러오기
  useEffect(() => {
    caxios.get("/member/me").then((res) => {
      setMyInfo(res.data);
      console.log(res.data);
    });
    fetchHomeData();
  }, [fetchHomeData]);

  /* ---------------------- Layout ---------------------- */
  // const defaultLayout = [
  //   { i: "notice", x: 0, y: 0, w: 12, h: 4 },
  //   { i: "mail", x: 4, y: 11, w: 4, h: 3 },
  //   { i: "vacation", x: 4, y: 4, w: 4, h: 3 },
  //   { i: "calendar", x: 0, y: 4, w: 4, h: 10 },
  //   //{ i: "profile", x: 8, y: 8, w: 4, h: 6 },
  //   { i: "myTask", x: 4, y: 7, w: 4, h: 4 },
  //   { i: "myPage", x: 8, y: 4, w: 4, h: 4 },
  // ];

  const defaultLayout = [
    { i: "notice", x: 4, y: 7, w: 4, h: 4 },
    { i: "mail", x: 8, y: 7, w: 4, h: 4 },
    { i: "calendar", x: 0, y: 0, w: 4, h: 11 },
    { i: "profile", x: 8, y: 0, w: 2, h: 7 },
    { i: "myTask", x: 4, y: 0, w: 4, h: 7 },
    { i: "myPage", x: 10, y: 0, w: 2, h: 7 },
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


  // 레이아웃 저장 로직
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

  // 일정
  useEffect(() => {
    const fetchMySchedules = async () => {
      try {
        const res = await caxios.get("/schedule/all");
        setMySchedules(res.data || []);
      } catch (err) {
        console.error("내 일정 불러오기 실패:", err);
        message.error("내 일정 데이터를 불러오지 못했습니다.");
      }
    };
    fetchMySchedules();
  }, []);



  const [tasks, setTasks] = useState([]);
  // 내정보, 업무
  useEffect(() => {
    caxios.get("/member/me").then((res) => {
      setMyInfo(res.data);
      console.log(res.data);
    });

    caxios.get("/task/assigned").then((res) => {
      setTasks(res.data);
      console.log(res.data);
    });

  }, []);
  const renderStatusTag = (status) => {
    const color =
      status === "진행중"
        ? "blue"
        : status === "대기"
          ? "gray"
          : status === "완료"
            ? "green"
            : "default";
    return <Tag color={color}>{status}</Tag>;
  };

  const taskColumns = [
    {
      title: "업무 그룹",
      dataIndex: "GROUP_NAME",
      key: "groupName",
      align: "center",
    },
    {
      title: "업무명",
      dataIndex: "TITLE",
      key: "taskName",
      align: "center",
    },
    {
      title: "생성자",
      dataIndex: "CREATED_NAME",
      key: "taskName",
      align: "center",
      render: (_, record) => `${record.CREATED_NAME} (${record.CREATED_ID})`,
    },
    {
      title: "상태",
      dataIndex: "STATUS",
      key: "status",
      align: "center",
      render: (status) => renderStatusTag(status),

      // 정렬 추가
      sorter: (a, b) => {
        const order = { 대기: 1, 진행중: 2, 완료: 3 };
        return order[a.STATUS] - order[b.STATUS];
      },
    },
    {
      title: "생성일시",
      dataIndex: "CREATED_AT",
      key: "createdAt",
      align: "center",
      render: (text) => dayjs(text).format("YYYY년 MM월 DD일 HH:mm"),
      sorter: (a, b) => dayjs(a.CREATED_AT).unix() - dayjs(b.CREATED_AT).unix(), // 날짜 정렬도 추가 가능
    },
  ];


  return (
    <div className={styles.container}>
      <ResponsiveGridLayout
        layout={layout}
        cols={12}
        rowHeight={50}
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
        <div key="notice" >
          <Card
            title={
              <span className={`${styles.cardHeader} drag-area`}>
                <MegaphoneFill /> 공지사항
              </span>
            }
            className={styles.card}
          >
            <List
              dataSource={["공지 2025년 상반기 인사평가 일정 공지","공지 연말 휴무 및 정산 일정 안내",  "공지 2025년 11월 전사 일정 안내"]}
              renderItem={(item) => {
                const parts = item.split("공지"); 
                return (
                  <List.Item style={{ fontSize: "13px" , cursor:"pointer" }}
                  onClick={ () => navigate ("board")}>
                    <span
                      style={{
                        backgroundColor: "#ffecb3",
                        color: "#d48806",
                        fontWeight: "bold",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        marginRight: "6px",
                
                      }}
                    >
                      공지
                    </span>
                    {parts[1]} {}
                  </List.Item>
                )
              }}
            />
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

        {/* 잔여 휴가  */}
        {/* <div key="vacation">
          <Card title={<span className={`${styles.cardHeader} drag-area`}><AirplaneFill /> 잔여 휴가</span>} className={styles.card}>
            <p>남은 휴가 : <b>{leaveCount}일</b></p>
            <Button type="primary" onClick={() => setIsLeaveModalOpen(true)}>
              휴가 신청
            </Button>
          </Card>
        </div> */}

        {/* 달력 */}
        <div key="calendar">
          <Card
            title={<span className={`${styles.cardHeader} drag-area`}><CalendarIcon className="icon" />내 일정</span>}
            className={styles.card}
          >
            <Calendar
              fullscreen={false}
              locale={locale} 
              dateCellRender={(value) => {
                const dateStr = value.format("YYYY-MM-DD");
                const daySchedules = mySchedules.filter(
                  (item) => item.startAt && item.startAt.startsWith(dateStr)
                );

                return (
                  <ul className={styles.scheduleList}>
                    {daySchedules.slice(0, 2).map((item) => (
                      <li key={item.seq} className={styles.scheduleItem}>
                        <span className={styles.dot}></span>
                        {item.title}
                      </li>
                    ))}
                    {daySchedules.length > 2 && (
                      <li className={styles.more}>+{daySchedules.length - 2}개</li>
                    )}
                  </ul>
                );
              }}
            />
          </Card>
        </div>

        {/* 출퇴근 */}
        <div key="profile">

          <Card title={<span className={`${styles.cardHeader} drag-area`} ><Repeat /> 출퇴근</span>} className={`${styles.card} `}>

            <div className={styles.clockHeader}>
              <span>출퇴근</span>
            </div>

            <div className={styles.liveClock}>{new Date().toLocaleTimeString("ko-KR")}</div>

            <div className={styles.workActions}>
              <button
                className={`${styles.clockBtn} ${styles.start} ${checkIn !== "-- : --" ? styles.disabledBtn : ""}`}
                onClick={handleCheckIn}
                disabled={checkIn !== "-- : --"}   // 클릭도 막기
              >
                출근
              </button>

              <button
                className={`${styles.clockBtn} ${styles.end} ${checkOut !== "-- : --" ? styles.disabledBtn : ""}`}
                onClick={handleCheckOut}
                disabled={checkOut !== "-- : --"}   // 클릭도 막기
              >
                퇴근
              </button>
            </div>
            <hr></hr>

            <div className={styles.timeLog}>
              <div><b>출근</b> {checkIn}</div>
              <div><b>퇴근</b> {checkOut}</div>
              <div><b>근무일수</b> {workDays}일</div>
            </div>
          </Card>
        </div>


        {/* 담당 업무*/}
        <div key="myTask">
          <Card title={<span className={`${styles.cardHeader} drag-area`}><PersonWorkspace /> 담당 업무</span>} className={styles.card} >

            <Table
              tableLayout="fixed"
              columns={taskColumns}
              dataSource={tasks}
              rowKey="seq"
              bordered={false}              // 테두리 제거
              pagination={
                tasks.length > 3
                  ? {
                    pageSize: 3,
                    showSizeChanger: false, // 사용자가 페이지당 항목 수 변경 불가
                  }
                  : false // 5개 이하일 땐 페이지네이션 숨김
              }

              onRow={(record) => ({
                onClick: () => navigate(`/task/group/${record.GROUP_SEQ}`),
              })}
              className={styles.styledTable}
            />

          </Card>
        </div>

        {/* 내 정보 */}
        <div key="myPage">
          <Card
            title={
              <span className={`${styles.cardHeader} drag-area`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PersonVcardFill /> 내 정보
              </span>
            }
            className={styles.card}
          >

            <div
              style={{
                display: "flex",
                flexDirection: "column", // 세로 배치로 변경
                alignItems: "center", // 가운데 정렬
                gap: 16,
              }}
            >
              {/* 프로필 이미지 */}
              <div style={{ flexShrink: 0 }}>
                <img
                  src={myInfo?.profileImage_servName ? `https://storage.googleapis.com/yj_study/${myInfo.profileImage_servName}` : defaultProfile}
                  alt="프로필 미리보기"
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ebebeb',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    marginTop: '5px'
                  }}
                />
              </div>
              <div style={{ display: 'block' }}>
                {/* 사용자 정보 */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
                  <div
                    className={styles.userName}
                    style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#222', marginBottom: 4 }}
                  >
                    {myInfo?.name || "로딩 중..."}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 15, color: '#555', marginBottom: 2 }}>
                    {ranks[myInfo?.rank_code] || "--"} / {myInfo?.dept_code || "--"}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 14, color: '#888', marginBottom: 5 }}>
                    {myInfo?.officeEmail || "--"}
                  </div>
                  <hr></hr>
                  {/* 정보 수정 버튼 */}
                  <Button
                    type="primary"
                    size="small"
                    style={{ alignSelf: 'center', borderRadius: 4, padding: '4px 12px', marginTop: '10px' }}
                    onClick={() => navigate("/mypage")} // 여기에 수정 모달 연결 가능
                  >
                    정보 수정
                  </Button>
                </div>
              </div>
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
