
import Messenger from "./Messenger";
import { Routes, Route } from "react-router-dom";

const MessengerRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<Messenger />} />

        </Routes>
    );
}

export default MessengerRoute;