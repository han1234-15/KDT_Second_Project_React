import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import styles from "./ScheduleTabs.module.css";

const ScheduleTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ 모달 상태 상위로 이동

  const mainTabs = [{ label: "내 일정", path: "/schedule" }];

  const subTabs = [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <ContentTap
          mainTabs={mainTabs}
          subTabs={subTabs}
          activePath={location.pathname}
          onMainClick={(path) => navigate(path)}
          onSubClick={(path) => navigate(path)}
        />

        {/* ✅ 일정 추가 버튼 */}
        {location.pathname.startsWith("/schedule") && (
          <button
            className={styles.writeBtn}
            onClick={() => setIsModalOpen(true)} // ✅ 버튼 클릭 시 모달 오픈
          >
            + 일정 추가
          </button>
        )}
      </div>

      {/* ✅ Schedule 컴포넌트에 모달 상태 전달 */}
      <Outlet context={{ isModalOpen, setIsModalOpen }} />
    </div>
  );
};

export default ScheduleTabs;
