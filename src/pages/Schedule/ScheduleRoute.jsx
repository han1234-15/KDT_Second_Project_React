
import Schedule from "./Schedule";
import { Routes, Route } from "react-router-dom";

const ScheduleRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<Schedule />} />

        </Routes>
    );
}

export default ScheduleRoute;