import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import styles from "./ScheduleTabs.module.css";

const ScheduleTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainTabs = [
    { label: "내 일정", path: "/schedule/1" },
    { label: "전체 일정", path: "/schedule/all" },
    { label: "중요 일정", path: "/schedule/important" },
  ];

  const subTabs = [
    { label: "개인 일정", path: "/schedule/1" },
    { label: "전사 일정", path: "/schedule/2" },
    { label: "프로젝트", path: "/schedule/3" },
  ];

  // ✅ 내 일정일 때만 서브탭 표시
  const isMySchedule =
    location.pathname.startsWith("/schedule/1") ||
    location.pathname.startsWith("/schedule/2") ||
    location.pathname.startsWith("/schedule/3");

  // ✅ 서브탭 없을 때 높이 유지용 클래스 추가
  const subTabSpacer =
    !isMySchedule && location.pathname.startsWith("/schedule")
      ? <div className={styles.subTabPlaceholder}></div>
      : null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <ContentTap
          mainTabs={mainTabs}
          subTabs={isMySchedule ? subTabs : []}
          activePath={location.pathname}
          onMainClick={(path) => navigate(path)}
          onSubClick={(path) => navigate(path)}
        />

        {/* 일정 추가 버튼 */}
        {location.pathname.startsWith("/schedule") && (
          <button
            className={styles.writeBtn}
            onClick={() => setIsModalOpen(true)}
          >
            + 일정 추가
          </button>
        )}
      </div>

      {/* ✅ 서브탭 없는 페이지에서 높이 유지용 공간 */}
      {subTabSpacer}

      {/* Schedule 컴포넌트에 모달 상태 전달 */}
      <Outlet context={{ isModalOpen, setIsModalOpen }} />
    </div>
  );
};

export default ScheduleTabs;
