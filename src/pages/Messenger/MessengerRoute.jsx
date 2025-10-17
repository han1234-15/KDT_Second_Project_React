import Messenger from "./Messenger"; // ✅ 이름 수정
import { Routes, Route } from "react-router-dom";

const MessengerRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Messenger />} />
    </Routes>
  );
};

export default MessengerRoute;