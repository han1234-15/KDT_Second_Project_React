import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import ContentTap from "../Common/ContentTap";
import "./styles/ApprovalPage.css";

const EApprovalTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /** 메인 탭 */
  const mainTabs = [
    { label: "진행 문서함", path: "/Eapproval/show" },
    { label: "문서 보관함", path: "/Eapproval/pass" }
  ];

  /** 진행 문서함 sub Tab */
  const subTabsProgress = [
    { label: "전체", path: "/Eapproval/show" },
    { label: "승인 대기", path: "/Eapproval/pending" },
    { label: "진행 중", path: "/Eapproval/in_progress" },
    { label: "반려", path: "/Eapproval/rejected" },
    { label: "임시 저장", path: "/Eapproval/TEMP" }
  ];

  /** 문서 보관함 sub Tab */
  const subTabsStore = [
    { label: "기안", path: "/Eapproval/pass" },
    { label: "예정", path: "/Eapproval/approved" }
  ];

  /** 현재 상태(status) 추출 */
  const status = location.pathname.replace("/Eapproval/", "");

  /** 메인 탭 활성 기준 그룹 */
  const progressStatus = ["show", "pending", "in_progress", "rejected", "TEMP"];
  const storeStatus = ["pass", "approved"];

  /** ✅ ContentTap으로 보낼 메인탭 activePath (그룹화 처리되는 Path 전달) */
  const mainActivePath = progressStatus.includes(status)
    ? "/Eapproval/show"
    : "/Eapproval/pass";

  /** ✅ 서브탭은 자신 경로로 정확히 활성 */
  const subActivePath = location.pathname;

  /** ✅ 현재 서브탭 세트 선택 */
  const currentSubTabs = storeStatus.includes(status)
    ? subTabsStore
    : subTabsProgress;

  return (
    <div className="wrapper">
      <div className="headerRow">
        <ContentTap
          mainTabs={mainTabs}
          subTabs={currentSubTabs}
          activePath={mainActivePath}   // (메인 탭 기준)
          activeSubPath={subActivePath} // (서브 탭 기준)
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
