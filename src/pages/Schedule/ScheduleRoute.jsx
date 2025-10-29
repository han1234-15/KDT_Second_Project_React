import { Routes, Route, Navigate } from "react-router-dom";
import ScheduleTabs from "./ScheduleTabs";
import Schedule from "./Schedule";

const ScheduleRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<ScheduleTabs />}>
        <Route index element={<Navigate to="all" replace />} />
        <Route path=":category" element={<Schedule />} />
      </Route>
    </Routes>
  );
};

export default ScheduleRoute;
