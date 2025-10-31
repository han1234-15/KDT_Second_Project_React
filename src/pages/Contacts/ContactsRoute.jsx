import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Contacts from "./Contacts";
import ContactsAdd from "./ContactsAdd";
import ContactsAddMulti from "./ContactsAddMulti";
import ContactsSolo from "./ContactsSolo";
import ContactsMulti from "./ContactsMulti";
import ContactsTab from "./ContactsTab";
import Organization from './Organization.jsx';
import OrganizationView from "./OrganizationView.jsx";

const ContactsRoute = () => {

    return (
        <Routes>
            <Route path="/" element={<ContactsTab />} >
                <Route index element={<Navigate to="all" replace />} />
                <Route path="all" element={<Contacts />} ></Route>
                <Route path="solo" element={<ContactsSolo />} />
                <Route path="multi" element={<ContactsMulti />} />
                <Route path="organization" element={<Organization />} />
                <Route path="organizationview" element={<OrganizationView />} />
            </Route>

            <Route path="add" element={<ContactsAdd />} />
            <Route path="addmulti" element={<ContactsAddMulti />} />

        </Routes>
    );
}

export default ContactsRoute;