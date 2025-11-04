import React from "react";
import { useNavigate, useLocation, Outlet, useParams } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import styles from "./BoardTabs.module.css";

const BoardTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category_id } = useParams();

  const mainTabs = [
    { label: "게시판", path: "/board/1/" },
    { label: "중요게시물", path: "/board/important" },
  ];

  const subTabs = [
    { label: "사내게시판", path: `/board/${category_id}/announcement` },
    { label: "자유게시판", path: `/board/${category_id}/freedom` },
    { label: "익명게시판", path: `/board/${category_id}/anonymity` },
  ];

  // 중요게시물 / 자료실에서는 서브탭 숨기기
  const showSubTabs =
    location.pathname.includes("/announcement") ||
    location.pathname.includes("/freedom") ||
    location.pathname.includes("/anonymity");

  // 글쓰기 버튼 클릭 시: 현재 탭에 맞게 이동
  const handleWriteClick = () => {
    const currentTab = location.pathname.split("/").pop(); // ex) "freedom", "important"
    const categoryMap = {
      announcement: "1",
      freedom: "2",
      anonymity: "3",
    };

    // 중요게시물은 category_id가 없으니 별도 처리
    const currentCategory =
      currentTab === "important"
        ? "important"
        : categoryMap[currentTab] || category_id;

    navigate(`/board/write?category=${currentCategory}&from=${location.pathname}`);
  };

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.headerRow}>
        <ContentTap
          mainTabs={mainTabs}
          subTabs={showSubTabs ? subTabs : []}
          activePath={location.pathname}
          onMainClick={(path) => navigate(path)}
          onSubClick={(path) => navigate(path)}
        />

        {/* ✅ 모든 탭에서 글쓰기 버튼 유지 */}
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
