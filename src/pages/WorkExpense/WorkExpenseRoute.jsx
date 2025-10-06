
import WorkExpense from "./WorkExpense";
import { Routes, Route } from "react-router-dom";

const WorkExpenseRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<WorkExpense />} />

        </Routes>
    );
}

export default WorkExpenseRoute;