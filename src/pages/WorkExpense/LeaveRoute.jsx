import LeaveStatus from "./LeaveStatus";
import { Routes, Route } from "react-router-dom";

const LeaveRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<LeaveStatus />} /> {/*경로이동*/}
        </Routes>
    );
}

export default LeaveRoute;
