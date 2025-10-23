import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import styles from "./BoardTabs.module.css";

const BoardTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainTabs = [
    { label: "게시판", path: "/board" },
    { label: "중요게시물", path: "/board/boardDetail" },
    { label: "자료실", path: "/board/data_room" },
  ];

  const subTabs = [
    { label: "공지사항", path: "/board/announcement" },
    { label: "자유게시판", path: "/board/freedom" },
    { label: "익명게시판", path: "/board/anonymity" },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        {/* 왼쪽 탭 영역 */}
        <ContentTap
          mainTabs={mainTabs}
          subTabs={subTabs}
          activePath={location.pathname}
          onMainClick={(path) => navigate(path)}
          onSubClick={(path) => navigate(path)}
        />

        {/* 오른쪽 버튼 영역 */}
        {location.pathname.startsWith("/board") && (
          <button
            className={styles.writeBtn}
            onClick={() => navigate("/board/boardWrite")}
          >
            글 작성하기
          </button>
        )}
      </div>

      {/* 실제 콘텐츠 출력 */}
      <Outlet />
    </div>
  );
};

export default BoardTabs;
