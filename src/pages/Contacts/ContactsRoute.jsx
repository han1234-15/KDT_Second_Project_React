import React from "react";
import { Routes, Route } from "react-router-dom";
import Contacts from "./Contacts";
import ContactsAdd from "./ContactsAdd";
import ContactsAddMulti from "./ContactsAddMulti";
import ContactsSolo from "./ContactsSolo";
import ContactsMulti from "./ContactsMulti";
import ContactsTab from "./ContactsTab";
import test from "./test";
const ContactsRoute = () => {

    return (
        <Routes>
            <Route path="/" element={<ContactsTab />} >
                <Route path="solo" element={<ContactsSolo />} />
                <Route path="multi" element={<ContactsMulti />} />.
                <Route path="test" element={<test />} />
            </Route>
            <Route path="add" element={<ContactsAdd />} />
                <Route path="addmulti" element={<ContactsAddMulti />} />
                
        </Routes>
    );
}

export default ContactsRoute;