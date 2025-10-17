
import Management from "./Management";
import UserRegister from "./UserRegister";
import { Routes, Route } from "react-router-dom";

const ManagementRoute = () => {

    return (
        
        <Routes>
            <Route path="/" element={<Management />} />
            <Route path="/register" element={<UserRegister />} />
        </Routes>
    );
}

export default ManagementRoute;