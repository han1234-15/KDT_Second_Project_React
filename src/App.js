import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import styles from "./App.module.css";

// 외부 페이지 컴포넌트 import
import Home from "./pages/Home/Home";
import MailRoute from "./pages/Mail/MailRoute";
import Board from "./pages/Board/Board";
import Schedule from "./pages/Schedule/Schedule";
import SharedMailRoute from "./pages/SharedMail/SharedMailRoute";
import ContactsRoute from "./pages/Contacts/ContactsRoute";
import Messenger from "./pages/Messenger/Messenger";
import WorkExpense from "./pages/WorkExpense/WorkExpense";
import EApproval from "./pages/EApproval/EApproval";
import Note from "./pages/Note/Note";
import Task from "./pages/Task/Task";
import Management from "./pages/Management/Management";


const Header = () => {
  return (
    <div className={styles.header}>
      <h1>My App</h1>
      <div>
        <Link to="/">Home</Link>
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <Link to="/" className={styles.sidebarButton}>홈</Link>
      <Link to="/mail" className={styles.sidebarButton}>메일</Link>
      <Link to="/board" className={styles.sidebarButton}>게시판</Link>
      <Link to="/schedule" className={styles.sidebarButton}>일정</Link>
      <Link to="/sharedMail" className={styles.sidebarButton}>공용 메일</Link>
      <Link to="/contacts" className={styles.sidebarButton}>주소록</Link>
      <Link to="/messenger" className={styles.sidebarButton}>메신저</Link>
      <Link to="/workExpense" className={styles.sidebarButton}>근무/경비처리</Link>
      <Link to="/eApproval" className={styles.sidebarButton}>전자결재</Link>
      <Link to="/note" className={styles.sidebarButton}>쪽지</Link>
      <Link to="/task" className={styles.sidebarButton}>업무관리</Link>
      <Link to="/management" className={styles.sidebarButton}>그룹웨어 관리</Link>
    </div>
  );
};


function App() {
  return (
    <BrowserRouter>
      <div className={styles.appWrapper}>
        <Header />
        <div className={styles.container}>
          <Sidebar />
          <div className={styles.content}>
            <Routes>
              <Route path="/*" element={<Home />} />
              <Route path="/mail/*" element={<MailRoute />} />
              <Route path="/board/*" element={<Board />} />
              <Route path="/schedule/*" element={<Schedule />} />
              <Route path="/sharedmail/*" element={<SharedMailRoute />} />
              <Route path="/contacts/*" element={<ContactsRoute />} />
              <Route path="/messenger/*" element={<Messenger />} />
              <Route path="/workExpense/*" element={<WorkExpense />} />
              <Route path="/eApproval/*" element={<EApproval />} />
              <Route path="/note/*" element={<Note />} />
              <Route path="/task/*" element={<Task />} />
              <Route path="/management/*" element={<Management />} />
              <Route path="*" element={<h2>404 Not Found</h2>} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
