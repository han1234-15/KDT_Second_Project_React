import React, { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import { WidthProvider } from "react-grid-layout";   // ✅ 추가
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Card, Button, Calendar, List, Avatar, Select } from "antd";
import {
  BellFill,
  EnvelopeFill,
  CalendarFill as CalendarIcon,
  PersonCircle,
  BoxArrowInRight,
  BoxArrowRight,
} from "react-bootstrap-icons";
import styles from "./Home.module.css";

// ✅ WidthProvider로 감싼 GridLayout
const ResponsiveGridLayout = WidthProvider(GridLayout);

function Home() {
  const [status, setStatus] = useState("근무중");

  const defaultLayout = [
    { i: "notice", x: 0, y: 0, w: 12, h: 4 },
    { i: "profile", x: 8, y: 0, w: 4, h: 12 },
    { i: "mail", x: 0, y: 4, w: 4, h: 2 },
    { i: "vacation", x: 4, y: 4, w: 4, h: 2 },
    { i: "calendar", x: 0, y: 7, w: 8, h: 8 },
  ];

  const [layout, setLayout] = useState(defaultLayout);

  useEffect(() => {
    const saved = localStorage.getItem("dashboardLayout");
    if (saved) {
      setLayout(JSON.parse(saved));
    }
  }, []);

  const notifications = ["공지사항 1", "공지사항 2", "공지사항 3"];
  const mails = ["새 메일 1", "새 메일 2"];
  const attendanceLogs = [
    { date: "2025-10-24", in: "09:05", out: "18:10" },
    { date: "2025-10-23", in: "09:00", out: "18:00" },
  ];

  return (
    <div className={styles.container}>
      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={50}
        autoSize={true}
        isResizable={false}
        compactType={null}
        preventCollision={true}
        margin={[16, 16]}
        draggableHandle={`.${styles.cardHeader}`}
        onLayoutChange={(newLayout) => {
          localStorage.setItem("dashboardLayout", JSON.stringify(newLayout));
        }}
      >
        {/* 공지사항 */}
        <div key="notice">
          <Card
            title={
              <span className={styles.cardHeader}>
                <BellFill className={styles.headerIcon} /> 공지사항
              </span>
            }
            className={styles.card}
            styles={{ body: { padding: "14px 18px" } }}
          >
            <List
              dataSource={notifications}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </div>

        {/* 메일 알림 */}
        <div key="mail">
          <Card
            title={
              <span className={styles.cardHeader}>
                <EnvelopeFill className={styles.headerIcon} /> 메일 알림
              </span>
            }
            className={styles.card}
            styles={{ body: { padding: "14px 18px" } }}
          >
            <List
              dataSource={mails}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </div>

        {/* 잔여 휴가 */}
        <div key="vacation">
          <Card
            title={
              <span className={styles.cardHeader}>
                <CalendarIcon className={styles.headerIcon} /> 잔여 휴가
              </span>
            }
            className={styles.card}
            styles={{ body: { padding: "14px 18px" } }}
          >
            <p>
              잔여 휴가: <span className={styles.highlight}>12일</span>
            </p>
            <Button type="primary">휴가 신청</Button>
          </Card>
        </div>

        {/* 일정 달력 */}
        <div key="calendar">
          <Card
            title={<span className={styles.cardHeader}>📅 일정 달력</span>}
            className={styles.card}
            styles={{ body: { padding: "0 0 8px 0" } }}
          >
            <div className={styles.calendarWrap}>
              <Calendar fullscreen={false} />
            </div>
          </Card>
        </div>

        {/* 프로필 카드 */}
        <div key="profile">
          <Card className={styles.card} styles={{ body: { padding: "16px" } }}>
            <div className={styles.profileWrap}>
              <Avatar size={80} icon={<PersonCircle />} />
              <h5 className={styles.profileName}>박지은</h5>
              <p className={styles.profileTitle}>영업팀 대리</p>
              <Select
                value={status}
                onChange={setStatus}
                className={styles.statusSelect}
                options={[
                  { value: "근무중", label: "근무중" },
                  { value: "다른 용무중", label: "다른 용무중" },
                  { value: "자리비움", label: "자리비움" },
                ]}
              />

              {/* 출퇴근 버튼 */}
              <div style={{ marginTop: "16px" }}>
                <Button
                  type="primary"
                  icon={<BoxArrowInRight />}
                  className={styles.btnSpacing}
                >
                  출근
                </Button>
                <Button danger icon={<BoxArrowRight />}>
                  퇴근
                </Button>
              </div>

              {/* 출퇴근 로그 */}
              <div style={{ marginTop: "16px", width: "100%" }}>
                <h4 style={{ textAlign: "left" }}>출퇴근 기록</h4>
                <List
                  dataSource={attendanceLogs}
                  renderItem={(log) => (
                    <List.Item>
                      {log.date} - 출근 {log.in} / 퇴근 {log.out}
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}

export default Home;