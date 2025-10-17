import styles from "./Messenger.module.css";
import React, { useEffect, useState } from "react";
import { caxios } from "../../config/config";


const ContactList = () => {

const [member, setMember] = useState([]);

 useEffect(() => {
    caxios.get("/messenger/member")
      .then(resp => {
        console.log(resp.data);
        setMember(resp.data);
      })
      .catch(error => {
        console.error("데이터 요청 실패:", error);
      });
  }, []);


 return(
  <ul>
    <li>&gt; 연구&개발 <span>(15/21)</span></li>
    <li>&gt; 사업관리팀 <span>(5/9)</span></li>
    <li>&gt; AI센터 <span>(10/10)</span></li>
    <li>&gt; 인사과 <span>(3/05)</span></li>
    <li>&gt; 재무/회계 <span>(15/18)</span></li>
    <li>&gt; 마케팅팀 <span>(10/15)</span></li>
  </ul>
 );
};
export default ContactList;
