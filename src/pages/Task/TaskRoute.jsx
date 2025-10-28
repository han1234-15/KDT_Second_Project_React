
import Task from "./Task";
import { Routes, Route, Navigate } from "react-router-dom";
import TaskTab from "./TaskTab";
import TaskGroup from "./TaskGroup.jsx";
import TaskGroupAdd from "./TaskGroupAdd";
import TaskResponsible from "./TaskResponsible.jsx";
import TaskDataAdd from "./TaskDataAdd.jsx";
import TaskResponsibleAdd from "./TaskResponsibleAdd.jsx";


const TaskRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<TaskTab />} >
                <Route index element={<Navigate to="group" replace />} />
                <Route path="group" element={<TaskGroup />} />
                <Route path="responsible" element={<TaskResponsible />} />
            </Route>

            <Route path="groupAdd" element={<TaskGroupAdd />} />
            <Route path="dataAdd" element={<TaskDataAdd />} />
            <Route path="responsibleAdd" element={<TaskResponsibleAdd />} />
        </Routes>


    );
}

export default TaskRoute;