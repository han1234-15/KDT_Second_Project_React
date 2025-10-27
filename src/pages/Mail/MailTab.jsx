
import { useLocation, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ContentTap from "../Common/ContentTap";

const ContactsTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainTabs = [
    { label: "받은 메일함", path: "/mail/all" },
    { label: "보낸 메일함", path: "/mail/mailsent" }
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

      </div>

      {/* 실제 콘텐츠 출력 */}
      <Outlet />
    </div>
  );
};

export default ContactsTabs;
