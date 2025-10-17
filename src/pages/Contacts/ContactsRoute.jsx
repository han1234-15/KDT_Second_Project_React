import React from "react";
import { Routes, Route } from "react-router-dom";
import Contacts from "./Contacts";
import ContactsAdd from "./ContactsAdd";
import ContactsAddMulti from "./ContactsAddMulti";
import ContactsSolo from "./ContactsSolo";
import ContactsMulti from "./ContactsMulti";

const ContactsRoute = () => {

    return (
        <Routes>
            <Route path="/" element={<Contacts />} />
            <Route path="add" element={<ContactsAdd />} />
              <Route path="addmulti" element={<ContactsAddMulti />} />
            <Route path="solo" element={<ContactsSolo />} />
            <Route path="multi" element={<ContactsMulti/>} />
        </Routes>
    );
}

export default ContactsRoute;