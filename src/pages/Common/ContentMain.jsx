import { Routes, Route, useLocation } from "react-router-dom";
import styles from "./ContentMain.module.css";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Home from "../Home/Home";
import MailRoute from "../Mail/MailRoute";
import BoardRoute from "../Board/BoardRoute";
import ScheduleRoute from "../Schedule/ScheduleRoute";
import ContactsRoute from "../Contacts/ContactsRoute";
import MessengerRoute from "../Messenger/MessengerRoute";
import WorkExpenseRoute from "../WorkExpense/WorkExpenseRoute";
import EapprovalRoute from "../EApproval/EApprovalRoute";
import NoteRoute from "../Note/NoteRoute";
import TaskRoute from "../Task/TaskRoute";
import ManagementRoute from "../Management/ManagementRoute";
import MyPage from "./Mypage.jsx";
import LeaveRoute from "../WorkExpense/LeaveRoute";
import NotificationSocket from "../../config/NotificationSocket.js";

const ContentMain = () => {
  const location = useLocation();

  return (
    
    <div className={styles.container}>
      <NotificationSocket />
      {/* ✅ 헤더 */}
      <header className={styles.header}>
        <Header />
      </header>

      {/* ✅ 메인 (사이드 + 컨텐츠) */}
      <main className={styles.main}>
        {/* 사이드바 */}
        <aside className={styles.side}>
          <Sidebar />
        </aside>

        {/* 컨텐츠 */}
        <section className={styles.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mail/*" element={<MailRoute />} />
            <Route path="/board/*" element={<BoardRoute />} />
            <Route path="/schedule/*" element={<ScheduleRoute />} />
            <Route path="/contacts/*" element={<ContactsRoute />} />
            <Route path="/messenger/*" element={<MessengerRoute />} />
            <Route path="/workExpense/*" element={<WorkExpenseRoute />} />
            <Route path="/Eapproval/*" element={<EapprovalRoute />} />
            <Route path="/note/*" element={<NoteRoute />} />
            <Route path="/task/*" element={<TaskRoute />} />
            <Route path="/management/*" element={<ManagementRoute />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/leave/*" element={<LeaveRoute />} />
            <Route path="*" element={<h2>404 Not Found</h2>} />
          </Routes>
        </section>
      </main>
    </div>
  );
};

export default ContentMain;
