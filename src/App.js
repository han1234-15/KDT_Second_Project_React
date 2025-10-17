import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import styles from "./App.module.css";
import useAuthStore from "./store/authStore";

// ===== 외부 페이지 import =====
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

// ===== 공통 컴포넌트 =====
import Header from "./pages/Common/Header";
import Sidebar from "./pages/Common/Sidebar";

// ==========================
// ✅ 메인 App 컴포넌트 시작
// ==========================
function App() {
  const isLogin = useAuthStore((state) => state.isLogin);
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(true);

  // ✅ 세션에 토큰이 있으면 자동 로그인 처리
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      login(token);
    }
    setLoading(false);
  }, [login]);

  // ✅ 토큰 확인 중일 때 렌더링 방지
  if (loading) return null;

  // ✅ 로그인 안 되어 있으면 로그인 페이지로
  if (!isLogin) return <Login />;

  return (
     <BrowserRouter>
      <div className={styles.container}>
        <Header />  {/* pages/Common 폴더에 Header.jsx있음 */}
        <div className={styles.main}>
          <div className={styles.side}>
          <Sidebar /> {/* pages/Common 폴더에 Sidebar.jsx있음 */}
          </div>
          <div className={styles.content}>
            <Routes>

              <Route path="/*" element={<Home />} />
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
    
    </BrowserRouter>
  );
}

export default App;
