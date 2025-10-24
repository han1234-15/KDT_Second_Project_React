import MailArchive from "./MailArchive";
import ConnectHistory from "./ConnectHistory";
import Management from "./Management";
import ManagementTabs from "./ManagementTabs";
import Manager from "./Manager";
import UserDetail from "./UserDetail";
import UserRegister from "./UserRegister";
import { Routes, Route, Navigate } from "react-router-dom";

const ManagementRoute = () => {

    return (
        <Routes>
            <Route path="/" element={<ManagementTabs />}>
                <Route index element={<Navigate to="user" replace />} />
                 <Route path="user" element={<Management />} />
                 <Route path="history" element={<ConnectHistory />} />
                 <Route path="manager" element={<Manager />} />
                 <Route path="archive" element={<MailArchive />} />
            </Route>
            
            <Route path="register" element={<UserRegister />} />
            <Route path="user/detail/:id" element={<UserDetail />} />
        </Routes >
    );
}

export default ManagementRoute;