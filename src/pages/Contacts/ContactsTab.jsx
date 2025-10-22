
import { useLocation, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ContentTap from "../Common/ContentTap";

const ContactsTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

   const mainTabs = [
    { label: "전체 주소록", path: "/contacts/all" },
    { label: "개인 주소록", path: "/contacts/solo" },
    { label: "공용 주소록", path: "/contacts/multi" },
     { label: "test", path: "/contacts/test" }
  ];

const subTabs = [
    ];

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

        {/* 오른쪽 버튼 영역 */}
        {location.pathname.startsWith("/board") && (
          <button
            
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

export default ContactsTabs;
