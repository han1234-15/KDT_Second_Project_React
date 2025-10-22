import ChatRoom from "./ChatRoom";
import { Routes, Route } from "react-router-dom";

const ChatRoomRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatRoom />} />
    </Routes>
  );
};

export default ChatRoomRoute;