import Mail from "./Mail";
import MailView from "./MailView";
import MailWrite from "./MailWrite";
import { Routes, Route } from "react-router-dom";

const MailRoute = () => {

    return (


        <Routes>
            <Route path="/" element={<Mail />} />
            <Route path="mailview" element={<MailView />} /> {/* Mail 보는 페이지 추가 10.05 박민규  */}
            <Route path="mailwrite" element={<MailWrite />} /> {/* Mail 쓰는 페이지 추가 10.05 박민규 */}
        </Routes>
    );
}

export default MailRoute;