import styles from "./Contacts.module.css";
import { useEffect, useState } from 'react';
import { caxios } from '../../config/config.js';
import { useNavigate } from "react-router-dom";

const OrganizationView = ({ member, onClose }) => {
    return (


        <div className={styles.container}>

            <div className={styles.mainHeader} style={{marginTop:"20px"}}>
                <h2>{member.name} / {member.dept_code} / {member.rank_code}</h2>
            </div>
            <hr></hr>
            <div className={styles.mainBody} style={{ fontSize: "20px" , marginTop:"30px" }}>
                <p>아이디: {member.id}</p>
                <p>회사이메일: {member.officeEmail}</p>
                <p>개인이메일: {member.personalEmail}</p>
                <p>회사번호: {member.officePhone}</p>
                <p>개인번호: {member.mobilePhone}</p>
                <p>주소: {member.address_line1} {member.address_line2}</p>

                <button onClick={onClose} style={{ float: "right" }}>닫기</button>
            </div>


        </div>
    );
};

export default OrganizationView;
