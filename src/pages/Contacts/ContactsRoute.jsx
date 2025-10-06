import React from "react";
import { Routes, Route } from "react-router-dom";
import Contacts from "./Contacts";
import ContactsAdd from "./ContactsAdd";

const ContactsRoute = () => {

    return (
        <Routes>
            <Route path="/" element={<Contacts />} />
            <Route path="add" element={<ContactsAdd />} />
        </Routes>
    );
}

export default ContactsRoute