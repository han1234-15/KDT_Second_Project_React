
import Task from "./Task";
import { Routes, Route, Navigate } from "react-router-dom";
import TaskTab from "./TaskTab";
import TaskGroup from "./TaskGroup.jsx";
import TaskGroupAdd from "./TaskGroupAdd";
import TaskResponsible from "./TaskResponsible.jsx";
const TaskRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<TaskTab />} >
                <Route index element={<Navigate to="all" replace />} />
                <Route path="all" element={<Task />} />
                <Route path="group" element={<TaskGroup />} />
                <Route path="responsible" element={<TaskResponsible />} />
            </Route>
            <Route path="groupAdd" element={<TaskGroupAdd />} />

        </Routes>


    );
}

export default TaskRoute;