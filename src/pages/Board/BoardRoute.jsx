import React from "react";
import { Routes, Route } from "react-router-dom";
import Board from "./Board";

const BoardRoute = () => {

    return (
        <Routes>
            <Route path="/" element={<Board />} />

        </Routes>
    );
}

export default BoardRoute