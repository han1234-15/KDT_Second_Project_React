
import Note from "./Note";
import { Routes, Route } from "react-router-dom";

const NoteRoute = () => {

    return (

        <Routes>
            <Route path="/" element={<Note />} />

        </Routes>
    );
}

export default NoteRoute;