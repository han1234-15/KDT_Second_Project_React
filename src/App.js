import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styles from "./App.module.css";
import useAuthStore from './store/authStore';
// 외부 페이지 import
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
import Header from "./pages/Common/Header";
import Sidebar from "./pages/Common/Sidebar";
import useAuthStore from "./store/authStore";
import Login from "./pages/Login/Login";

const Header = () => (
  <div className={styles.header}>
    <h1>My App</h1>
    <div><Link to="/">Home</Link></div>
  </div>
);

const Sidebar = () => {
  const token = useAuthStore((state) => state.token); // ✅ 토큰 가져오기

  const openMessenger = () => {
    const width = 400;
    const height = 550;
    const left = window.screen.width - width - 40;
    const top = window.screen.height - height - 100;

    window.open(
      `${window.location.origin}/messenger-popup?token=${token}`,
      "MessengerPopup",
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no`
    );
  };

  return (
    <div className={styles.sidebar}>
      <Link to="/" className={styles.sidebarButton}>홈</Link>
      <Link to="/mail" className={styles.sidebarButton}>메일</Link>
      <Link to="/board" className={styles.sidebarButton}>게시판</Link>
      <Link to="/schedule" className={styles.sidebarButton}>일정</Link>
      <Link to="/sharedMail" className={styles.sidebarButton}>공용 메일</Link>
      <Link to="/contacts" className={styles.sidebarButton}>주소록</Link>

      {/* ✅ 메신저 팝업 버튼 */}
      <button className={styles.sidebarButton} onClick={openMessenger}>
        메신저
      </button>

      <Link to="/workExpense" className={styles.sidebarButton}>근무/경비처리</Link>
      <Link to="/eApproval" className={styles.sidebarButton}>전자결재</Link>
      <Link to="/note" className={styles.sidebarButton}>쪽지</Link>
      <Link to="/task" className={styles.sidebarButton}>업무관리</Link>
      <Link to="/management" className={styles.sidebarButton}>그룹웨어 관리</Link>
    </div>
  );
};

function AppContent() {
  return (
    <Routes>
      {/* ✅ Messenger는 독립 라우트 (헤더/사이드바 제외) */}
      <Route path="/messenger/*" element={<Messenger />} />

      {/* ✅ 나머지는 기본 그룹웨어 레이아웃 */}
      <Route
        path="/*"
        element={
          <div className={styles.appWrapper}>
            <Header />
            <div className={styles.container}>
              <Sidebar />
              <div className={styles.content}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/mail/*" element={<MailRoute />} />
                  <Route path="/board/*" element={<Board />} />
                  <Route path="/schedule/*" element={<Schedule />} />
                  <Route path="/sharedmail/*" element={<SharedMailRoute />} />
                  <Route path="/contacts/*" element={<ContactsRoute />} />
                  <Route path="/workExpense/*" element={<WorkExpense />} />
                  <Route path="/eApproval/*" element={<EApproval />} />
                  <Route path="/note/*" element={<Note />} />
                  <Route path="/task/*" element={<Task />} />
                  <Route path="/management/*" element={<Management />} />
                  <Route path="*" element={<h2>404 Not Found</h2>} />
                </Routes>
              </div>
            </div>
function App() {

  const isLogin = useAuthStore(state => state.isLogin)
  const login = useAuthStore(state => state.login);
  const [loading, setLoading] = useState(true); //로딩 확인용 상태변수

  useEffect(() => {
    // 세션에서 로그인 상태 확인
    const token = sessionStorage.getItem("token");
    if (token) {
      login(token); // token 자체를 store에 넣는게 일반적
    }
    setLoading(false); // 토큰 확인 후 렌더링 하도록 함.
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
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}