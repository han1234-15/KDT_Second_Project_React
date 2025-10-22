import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import EApproval from "./EApproval";
import EApprovalWrite from "./EApprovalWrite";
import EApprovalDetail from "./EApprovalDetail";
import EApprovalEdit from "./EApprovalEdit";
import EApprovalTabs from "./EApprovalTabs";

const EApprovalRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<EApprovalTabs />}>
        <Route index element={<Navigate to="show" replace />} />
        {/*  임시저장 수정 페이지 (우선 순위 1) */}
        <Route path="edit/:seq" element={<EApprovalEdit />} />

        {/*  상태별 조회 (show, pending, TEMP 등) */}
        <Route path=":status" element={<EApproval />} />
        {/*  기본 경로 - 전체 목록 */}
        <Route path="*" element={<EApproval />} />
      </Route>
      {/*  문서 작성 */}
      <Route path="write" element={<EApprovalWrite />} />
      {/* 문서 상세보기 (우선 순위 2) */}
      <Route path="detail/:seq" element={<EApprovalDetail />} />
    </Routes>
  );


};

export default EApprovalRoute;
