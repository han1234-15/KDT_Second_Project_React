
import Task from "./Task";
import { Routes, Route } from "react-router-dom";

const TaskRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<Task />} />

        </Routes>
    );
}

export default TaskRoute;