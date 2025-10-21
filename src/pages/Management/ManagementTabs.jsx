import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ContentTap from "../Common/ContentTap";

const ManagementTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainTabs = [
    { label: "사용자 관리", path: "user" },
    { label: "사용자 접속 내역", path: "history" },
    { label: "관리자 설정", path: "managerSet" },
    { label: "메일 아카이빙", path: "mailArchive" },
  ];

  const subTabs = [ ];

  return (
    <div >
      <div >
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

export default ManagementTabs;
