import { Routes, Route, Navigate } from "react-router-dom";
import BoardTabs from "./BoardTabs";
import BoardWrite from "./BoardWrite";
import BoardDetail from "./BoardDetail";
import BoardImportance from "./BoardImportance";
import BoardDataRoom from "./BoardDataRoom";
import BoardFreedom from "./BoardCategory/BoardFreedom";
import BoardAnonymity from "./BoardCategory/BoardAnonymity";
import BoardAnnouncement from "./BoardCategory/BoardAnnouncement";
import BoardEdit from "./BoardEdit";

const BoardRoute = () => {
  return (
    <Routes>
      {/* ✅ /board -> 자동 리디렉트 */}
      <Route index element={<Navigate to="/board/1/announcement" replace />} />

      {/* ✅ BoardTabs가 감싸는 구조 */}
      <Route path=":category_id" element={<BoardTabs />}>
        <Route index element={<Navigate to="announcement" replace />} />
        <Route path="announcement" element={<BoardAnnouncement />} />
        <Route path="freedom" element={<BoardFreedom />} />
        <Route path="anonymity" element={<BoardAnonymity />} />
        <Route path="importance" element={<BoardImportance />} />
        <Route path="dataroom" element={<BoardDataRoom />} />
      </Route>

      {/* ✅ 별도 페이지 */}
      <Route path="write" element={<BoardWrite />} />
      <Route path="detail/:seq" element={<BoardDetail />} />
      <Route path="edit/:seq" element={<BoardEdit />} />
    </Routes>
  );
};

export default BoardRoute;
