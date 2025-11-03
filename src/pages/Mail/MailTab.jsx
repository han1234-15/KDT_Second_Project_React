
import { useLocation, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import styles from "../Board/BoardTabs.module.css";


const ContactsTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainTabs = [
    { label: "받은 메일함", path: "/mail/all" },
    { label: "보낸 메일함", path: "/mail/mailsent" }
  ];

  const subTabs = [
  ];

  // 메일쓰기 버튼 클릭 시 이동
  const handleWriteClick = () => {
    navigate("/mail/mailwrite");
  };

  return (
    <div >
      <div >
        {/* 왼쪽 탭 영역 */}
        <ContentTap
          mainTabs={mainTabs}
          subTabs={subTabs}
          activePath={location.pathname}
          onMainClick={(path) => navigate(path)}
          onSubClick={(path) => navigate(path)}
        />

        {/* 모든 탭에서 글쓰기 버튼 유지 */}
        {!location.pathname.startsWith("/mail/mailwrite") && (
          <button className={styles.writeBtn} onClick={handleWriteClick}>
            메일쓰기
          </button>
        )}
      </div>

      {/* 실제 콘텐츠 출력 */}
      <Outlet />
    </div>
  );
};

export default ContactsTabs;
