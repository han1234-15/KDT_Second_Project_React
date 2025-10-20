import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styles from "./App.module.css";

// 외부 페이지 컴포넌트 import
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
import Messenger from "./pages/Messenger/Messenger"; // ✅ 메신저 본체 추가 import

// ===== 공통 컴포넌트 =====
import Header from "./pages/Common/Header";
import Sidebar from "./pages/Common/Sidebar";
import useAuthStore from "./store/authStore";
import Login from "./pages/Login/Login";
import { caxios } from "./config/config";

function App() {

  const isLogin = useAuthStore(state => state.isLogin)
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const [loading, setLoading] = useState(true); //로딩 확인용 상태변수

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      logout();
      setLoading(false);
      return;
    }

    caxios
      .get("/auth")
      .then((resp) => {
        login(token);
        console.log(resp);
      })
      .catch(() => {
        sessionStorage.removeItem("token");
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);



  //토큰을 확인하는데 시간이 걸려서 loading으로 토큰 확인이 끝나기 전까지 다른 컴포넌트가 렌더링 되지 않도록 함.
  if (loading) {
    return null; // 혹은 스켈레톤 화면, 로딩 스피너
  }

  // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
  if (!isLogin) {
    return <Login />;
  }

  // 로그인이 되어 있으면 url 링크에 맞춰서 동작.
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ 메신저 팝업 전용 라우트 */}
        <Route path="/messenger-popup/*" element={<Messenger />} />


        {/* ✅ 일반 그룹웨어 레이아웃 */}
        <Route
          path="/*"
          element={
            <div className={styles.container}>
              <Header /> {/* pages/Common 폴더에 Header.jsx */}
              <div className={styles.main}>
                <div className={styles.side}>
                  <Sidebar /> {/* pages/Common 폴더에 Sidebar.jsx */}
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