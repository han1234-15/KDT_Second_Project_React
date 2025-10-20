import Mail from "./Mail";
import MailView from "./MailView";
import MailWrite from "./MailWrite";
import MailSent from "./MailSent";
import MailAddContacts from "./MailAddContacts";
import { Routes, Route } from "react-router-dom";

const MailRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<Mail />} />
            <Route path="mailview" element={<MailView />} /> {/* Mail 보는 페이지 추가 10.05 박민규  */}
            <Route path="mailwrite" element={<MailWrite />} /> {/* Mail 쓰는 페이지 추가 10.05 박민규 */}
            <Route path="addcontacts" element={<MailAddContacts />} />
            <Route path="mailsent" element={<MailSent />} />
            
        </Routes>
    );
}

export default MailRoute;