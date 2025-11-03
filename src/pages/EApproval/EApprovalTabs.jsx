import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import "./styles/ApprovalPage.css";

const EApprovalTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /** 현재 상태(status) 추출 + 대문자로 통일 */
  const status = location.pathname.replace("/Eapproval/", "").toUpperCase();

  /** 메인 탭 */
  const mainTabs = [
    { label: "진행 문서함", path: "/Eapproval/show" },
    { label: "문서 보관함", path: "/Eapproval/APPROVED" }
  ];

  /** 진행 문서함 sub Tab */
  const subTabsProgress = [
    { label: "전체", path: "/Eapproval/show" },
    { label: "승인 대기", path: "/Eapproval/WAIT" },
    {label: "진행 중", path: "/Eapproval/PROCESSING"},
    { label: "반려", path: "/Eapproval/REJECTED" },
   
  ];

  /** 문서 보관함 sub Tab */
  const subTabsStore = [
    { label: "기안", path: "/Eapproval/APPROVED" },
    { label: "예정", path: "/Eapproval/PENDING" },
  ];

  /** 메인 탭 활성 기준 */
  const progressStatus = ["SHOW", "WAIT","PROCESSING", "REJECTED", "TEMP"];
  const storeStatus = ["APPROVED", "PENDING"];

  const mainActivePath = progressStatus.includes(status)
    ? "/Eapproval/show"
    : "/Eapproval/APPROVED";

  /** 현재 서브탭 선택 */
  const currentSubTabs = storeStatus.includes(status)
    ? subTabsStore
    : subTabsProgress;

  return (
    <div className="wrapper">
      <div className="headerRow">
        <ContentTap
          mainTabs={mainTabs}
          subTabs={currentSubTabs}
          activePath={mainActivePath}
          activeSubPath={location.pathname}
          onMainClick={(path) => navigate(path)}
          onSubClick={(path) => navigate(path)}
        />

        <button
          className="writeBtn"
          onClick={() => navigate("/Eapproval/write")}
        >
          + 작성하기
        </button>
      </div>

      <Outlet />
    </div>
  );
};

export default EApprovalTabs;
