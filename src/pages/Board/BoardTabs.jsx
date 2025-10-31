import React from "react";
import { useNavigate, useLocation, Outlet, useParams } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import styles from "./BoardTabs.module.css";

const BoardTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category_id } = useParams();

  const mainTabs = [
    { label: "게시판", path: "/board/1/announcement" },
    { label: "중요게시물", path: "/board/1/importance" },
    { label: "자료실", path: "/board/1/dataroom" },
  ];

  const subTabs = [
    { label: "공지사항", path: `/board/${category_id}/announcement` },
    { label: "자유게시판", path: `/board/${category_id}/freedom` },
    { label: "익명게시판", path: `/board/${category_id}/anonymity` },
  ];

  // ✅ 글쓰기 버튼 클릭 시: 현재 탭/게시판 정보를 URL 쿼리로 넘김
  const handleWriteClick = () => {
    const currentTab = location.pathname.split("/").pop(); // ex) "freedom"
    const categoryMap = {
      announcement: "1",
      freedom: "2",
      anonymity: "3",
      dataroom: "4",
    };
    const currentCategory = categoryMap[currentTab] || category_id;

    // 현재 탭과 경로를 함께 넘김
    navigate(`/board/write?category=${currentCategory}&from=${location.pathname}`);
  };

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
        {location.pathname.startsWith("/board") && (
          <button className={styles.writeBtn} onClick={handleWriteClick}>
            글 작성하기
          </button>
        )}
      </div>
      <Outlet />
    </div>
  );
};

export default BoardTabs;
