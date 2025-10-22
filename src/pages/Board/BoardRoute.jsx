import { Routes, Route, Navigate } from "react-router-dom";
import BoardTabs from "./BoardTabs";
import BoardWrite from "./BoardWrite";
import BoardDetail from "./BoardDetail";
import BoardFreedom from "./BoardFreedom";
import BoardAnonymity from "./BoardAnonymity";
import BoardDataRoom from "./BoardDataRoom";

const BoardRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<BoardTabs />}>
        <Route index element={<Navigate to="freedom" replace />} />
        <Route path="freedom" element={<BoardFreedom />} />
        <Route path="anonymity" element={<BoardAnonymity />} />
        <Route path="data_room" element={<BoardDataRoom />} />
      </Route>
      <Route path="boardWrite" element={<BoardWrite />} />
      <Route path="boardDetail" element={<BoardDetail />} />

    </Routes>
  );
};

export default BoardRoute;
