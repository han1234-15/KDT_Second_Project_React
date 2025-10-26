import LeaveStatus from "./LeaveStatus";
import { Routes, Route } from "react-router-dom";

const LeaveRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<LeaveStatus />} />
        </Routes>
    );
}

export default LeaveRoute;
