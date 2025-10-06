
import Management from "./Management";
import { Routes, Route } from "react-router-dom";

const ManagementRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<Management />} />

        </Routes>
    );
}

export default ManagementRoute;