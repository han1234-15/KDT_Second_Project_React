import React from "react";
import { Routes, Route } from "react-router-dom";
import EApproval from "./EApproval";

const EApprovalRoute = () => {

    return (
        <Routes>
            <Route path="/" element={<EApproval />} />

        </Routes>
    );
}

export default EApprovalRoute