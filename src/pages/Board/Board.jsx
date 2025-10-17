import React, { useState } from "react";
import styles from "./Board.module.css";

const Board = () => {
  const [activeTab, setActiveTab] = useState("진행중");
  const [activeSubTab, setActiveSubTab] = useState("결재");

  return (
    <div className={styles.boardContainer}>
      {/* ✅ 컨텐츠 헤더: 사이드 타이틀과 같은 높이/아래정렬/같은 border */}
      <div className={styles.contentHeader}>
        <div className={styles.mainTabs}>
          {["진행중", "문서함", "임시저장", "환경설정"].map((tab) => (
            <div
              key={tab}
              className={`${styles.mainTab} ${activeTab === tab ? styles.active : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* 하위 탭 */}
      <div className={styles.subTabs}>
        {["결재", "회람", "예정", "완료"].map((sub) => (
          <div
            key={sub}
            className={`${styles.subTab} ${activeSubTab === sub ? styles.active : ""}`}
            onClick={() => setActiveSubTab(sub)}
          >
            {sub}
          </div>
        ))}
      </div>

      <div className={styles.contentArea}>
        <p>
          현재 선택된 탭: <b>{activeTab}</b> / 세부 탭: <b>{activeSubTab}</b>
        </p>
      </div>
    </div>
  );
};

export default Board;
