import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styles from "./App.module.css";
import useAuthStore from "./store/authStore";

import Home from "./pages/Home/Home";
import MailRoute from "./pages/Mail/MailRoute";
import BoardRoute from "./pages/Board/BoardRoute";
import ScheduleRoute from "./pages/Schedule/ScheduleRoute";
import SharedMailRoute from "./pages/SharedMail/SharedMailRoute";
import ContactsRoute from "./pages/Contacts/ContactsRoute";
import MessengerRoute from "./pages/Messenger/MessengerRoute";
import WorkExpenseRoute from "./pages/WorkExpense/WorkExpenseRoute";
import EApprovalRoute from "./pages/EApproval/EApprovalRoute";
import NoteRoute from "./pages/Note/NoteRoute";
import TaskRoute from "./pages/Task/TaskRoute";
import ManagementRoute from "./pages/Management/ManagementRoute";
import Login from "./pages/Login/Login";
import Messenger from "./pages/Messenger/Messenger";
import ChatRoomRoute from "./pages/Messenger/ChatRoomRoute"; // ✅ 독립 라우트

import Header from "./pages/Common/Header";
import Sidebar from "./pages/Common/Sidebar";

function App() {
  const isLogin = useAuthStore((state) => state.isLogin);
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) login(token);
    setLoading(false);
  }, [login]);

  if (loading) return null;
  if (!isLogin) return <Login />;

  return (
    <BrowserRouter>
      <Routes>
        {/*  메신저 팝업 (Infinity UI) */}
        <Route path="/messenger-popup/*" element={<Messenger />} />

        {/*  독립 채팅방 팝업 (완전히 분리) */}
        <Route path="/chatroom/*" element={<ChatRoomRoute />} />

        {/* 그룹웨어 기본 구조 */}
        <Route
          path="/*"
          element={
            <div className={styles.container}>
              <Header />
              <div className={styles.main}>
                <div className={styles.side}>
                  <Sidebar />
                </div>
                <div className={styles.content}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/mail/*" element={<MailRoute />} />
                    <Route path="/board/*" element={<BoardRoute />} />
                    <Route path="/schedule/*" element={<ScheduleRoute />} />
                    <Route path="/sharedmail/*" element={<SharedMailRoute />} />
                    <Route path="/contacts/*" element={<ContactsRoute />} />
                    <Route path="/messenger/*" element={<MessengerRoute />} />
                    <Route path="/workExpense/*" element={<WorkExpenseRoute />} />
                    <Route path="/eApproval/*" element={<EApprovalRoute />} />
                    <Route path="/note/*" element={<NoteRoute />} />
                    <Route path="/task/*" element={<TaskRoute />} />
                    <Route path="/management/*" element={<ManagementRoute />} />
                    <Route path="*" element={<h2>404 Not Found</h2>} />
                  </Routes>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
