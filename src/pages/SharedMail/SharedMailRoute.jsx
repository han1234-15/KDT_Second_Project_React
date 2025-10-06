import { Routes, Route } from "react-router-dom";
import SharedMail from "./SharedMail";
import SharedMailWrite from "./SharedMailWrite.jsx";


const SharedMailRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<SharedMail />} />
            <Route path="write" element={<SharedMailWrite />} /> {/* 공유Mail 쓰는 페이지 추가 10.05 박민규 */}
        </Routes>
    )
}

export  default SharedMailRoute;