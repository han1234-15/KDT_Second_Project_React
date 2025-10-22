import React from "react";
import styles from "./ContentTap.module.css";

const ContentTap = ({
  mainTabs = [],
  subTabs = [],
  onMainClick,
  onSubClick,
  activePath = "",
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
              className={`${styles.subTab} ${isActive(tab.path) ? styles.active : ""}`}
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
