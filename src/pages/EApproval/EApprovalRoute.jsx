import React from "react";
import { Routes, Route } from "react-router-dom";
import EApproval from "./EApproval";
import EApprovalWrite from "./EApprovalWrite";
import EApprovalDetail from "./EApprovalDetail";

const EApprovalRoute = () => {
  return (
    <Routes>
      {/* 상태별 문서 조회 */}
      <Route path=":status" element={<EApproval />} />

      {/* 문서 작성 페이지 */}
      <Route path="write" element={<EApprovalWrite />} />

      {/* 기본 경로 → 전체 문서 (A) */}
      <Route path="*" element={<EApproval />} />


 
      <Route path="detail/:seq" element={<EApprovalDetail />} />
    </Routes>
  );
};

export default EApprovalRoute;
