import Mail from "./Mail";
import MailView from "./MailView";
import MailWrite from "./MailWrite";
import MailSent from "./MailSent";
import MailAddContacts from "./MailAddContacts";
import MailTab from "./MailTab";
import { Routes, Route, Navigate } from "react-router-dom";
import MailResponse from "./MailResponse";

const MailRoute = () => {

    return (

        <Routes>
            
            <Route path="/" element={<MailTab />} >
                <Route index element={<Navigate to="all" replace />} />
                <Route path="all" element={<Mail />} />
                <Route path="mailsent" element={<MailSent />} />
            </Route>

            <Route path="mailview" element={<MailView />} /> {/* Mail 보는 페이지 추가 10.05 박민규  */}
            <Route path="mailwrite" element={<MailWrite />} /> {/* Mail 쓰는 페이지 추가 10.05 박민규 */}
            <Route path="addcontacts" element={<MailAddContacts />} />
            <Route path="response" element={<MailResponse />} />

        </Routes>
    );
}

export default MailRoute;