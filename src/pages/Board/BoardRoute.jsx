import { Routes, Route, Navigate } from "react-router-dom";
import BoardTabs from "./BoardTabs";
import BoardWrite from "./BoardWrite";
import BoardDetail from "./BoardDetail";
import BoardImportance from "./BoardImportance";
import BoardDataRoom from "./BoardDataRoom";
import BoardFreedom from "./BoardCategory/BoardFreedom";
import BoardAnonymity from "./BoardCategory/BoardAnonymity";
import BoardAnnouncement from "./BoardCategory/BoardAnnouncement";

const BoardRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<BoardTabs />}>
        <Route index element={<Navigate to="announcement" replace />} />
        <Route path="announcement" element={<BoardAnnouncement />} />
        <Route path="freedom" element={<BoardFreedom />} />
        <Route path="anonymity" element={<BoardAnonymity />} />
        <Route path="importance" element={<BoardImportance />} />
        <Route path="dataroom" element={<BoardDataRoom />} />
      </Route>
      <Route path="boardWrite" element={<BoardWrite />} />
      <Route path="detail/:seq" element={<BoardDetail />} />

    </Routes>
  );
};

export default BoardRoute;
