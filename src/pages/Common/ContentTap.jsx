import React from "react";
import styles from "./ContentTap.module.css";
import { useSocket } from "../../config/SocketContext";

const ContentTap = ({
  mainTabs = [],
  subTabs = [],
  onMainClick,
  onSubClick,
  activePath = "",
  activeSubPath = "" // 전자결재에서만 해당
}) => {
  const isActive = (path) => activePath.startsWith(path);

  return (
    <div className={styles.boardContainer}>
      {/* 메인탭 */}
      <div className={styles.contentHeader}>
        <div className={styles.mainTabs}>
          {mainTabs.map((tab) => (
            <div
              key={tab.path}
              className={`${styles.mainTab} ${isActive(tab.path) ? styles.active : ""}`}
              onClick={() => onMainClick(tab.path)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* 서브탭 */}
      {subTabs.length > 0 && (
        <div className={styles.subTabs}>
          {subTabs.map((tab) => (
            <div
              key={tab.path}
              className={`${styles.subTab} ${
                activeSubPath
                  ? activeSubPath === tab.path // 전자결재일떄만
                    ? styles.active
                    : ""
                  : isActive(tab.path) // 다른 메뉴는 동일하게 유지
                    ? styles.active
                    : ""
              }`}
              onClick={() => onSubClick(tab.path)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentTap;
