import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import { caxios } from "../../config/config";

const ManagementTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainTabs = [
    { label: "사용자 관리", path: "/management/user" },
    { label: "사용자 접속 내역", path: "/management/history" },
    { label: "관리자 설정", path: "/management/manager" },
    { label: "메일 아카이빙", path: "/management/archive" },
  ];
  const subTabs = [];

  const [loading, setLoading] = useState(true); //로딩 확인용 상태변수
  
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        await caxios.get("/auth/check");
        //관리자인지 체크 먼저하고

        setLoading(false); // 여기서 false로 변경
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };

    fetchUserData();
  }, []);


  //토큰을 확인하는데 시간이 걸려서 loading으로 토큰 확인이 끝나기 전까지 다른 컴포넌트가 렌더링 되지 않도록 함.
  if (loading) {
    return null; // 혹은 스켈레톤 화면, 로딩 스피너
  }

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
